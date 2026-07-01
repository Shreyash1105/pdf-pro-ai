/**
 * Zero-Knowledge Client-Side End-to-End Encryption (E2EE) & Security Engine
 * Uses browser-native Web Crypto API with high-entropy PBKDF2 key derivation
 * and AES-GCM 256-bit authenticated encryption.
 */

// Derive a 256-bit AES-GCM key from a password and salt using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import raw password as a key-generating material
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive the AES-GCM key
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a file using client-side AES-256-GCM.
 * Packed Output Format:
 * [16 bytes: Salt] [12 bytes: IV] [Remaining: Ciphertext]
 */
export async function encryptFileClientSide(file: File, password: string): Promise<Blob> {
  const fileBuffer = await file.arrayBuffer();
  
  // Generate cryptographically secure random values
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Derive key
  const aesKey = await deriveKey(password, salt);
  
  // Encrypt the file buffer
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    aesKey,
    fileBuffer
  );
  
  // Assemble the packed binary structure
  const packedBuffer = new Uint8Array(salt.length + iv.length + ciphertextBuffer.byteLength);
  packedBuffer.set(salt, 0);
  packedBuffer.set(iv, salt.length);
  packedBuffer.set(new Uint8Array(ciphertextBuffer), salt.length + iv.length);
  
  // Store the original filename and mime type as a JSON header or simply keep it in file metadata
  // To keep it simple and robust, we preserve the filename upon decryption by appending ".secured"
  return new Blob([packedBuffer], { type: 'application/octet-stream' });
}

/**
 * Decrypts a packed binary blob back to its original array buffer.
 */
export async function decryptFileClientSide(
  file: File, 
  password: string
): Promise<{ decryptedBlob: Blob; originalFileName: string }> {
  const packedBuffer = new Uint8Array(await file.arrayBuffer());
  
  if (packedBuffer.length < 28) {
    throw new Error('Invalid or corrupted encrypted file. Size is too small.');
  }
  
  // Extract Salt, IV and Ciphertext
  const salt = packedBuffer.slice(0, 16);
  const iv = packedBuffer.slice(16, 28);
  const ciphertext = packedBuffer.slice(28);
  
  // Derive key using extracted salt
  const aesKey = await deriveKey(password, salt);
  
  try {
    // Decrypt ciphertext
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      aesKey,
      ciphertext
    );
    
    // Determine the original file name
    let originalFileName = file.name.replace(/\.secured$/, '');
    if (originalFileName === file.name) {
      originalFileName = 'decrypted_' + file.name;
    }
    
    // Infer mime-type from original filename extension
    let mimeType = 'application/octet-stream';
    if (originalFileName.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (originalFileName.endsWith('.png')) mimeType = 'image/png';
    else if (originalFileName.endsWith('.jpg') || originalFileName.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (originalFileName.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    const decryptedBlob = new Blob([decryptedBuffer], { type: mimeType });
    return { decryptedBlob, originalFileName };
  } catch (err) {
    throw new Error('Incorrect password or file integrity check failed.');
  }
}

/**
 * Client-side local Scam Shield Phishing scanner.
 * Scans document names, types, or extracted text features for high-risk fraud templates
 * (e.g., fraudulent billing alerts, support numbers, spoofing indicators).
 */
export interface ScamAnalysisResult {
  isSafe: boolean;
  riskScore: number; // 0 to 100
  triggers: string[];
  recommendation: string;
}

export function scanDocumentForScams(fileName: string, contentSample?: string): ScamAnalysisResult {
  const triggers: string[] = [];
  let score = 0;
  
  const textToScan = `${fileName} ${contentSample || ''}`.toLowerCase();
  
  // 1. Check for wire transfer & urgent bank scams
  const bankPatterns = [
    'wire transfer', 'swift transfer', 'urgently route', 'routing number',
    'bank wire', 'western union', 'moneygram', 'remittance instruction',
    'updated bank details', 'new banking details', 'payment receipt required'
  ];
  bankPatterns.forEach(pattern => {
    if (textToScan.includes(pattern)) {
      score += 25;
      triggers.push(`Financial Transfer Redirection: Found "${pattern}"`);
    }
  });
  
  // 2. Urgent / High Pressure Phishing triggers
  const urgentPatterns = [
    'urgent action', 'account suspended', 'immediate verification',
    'unauthorized access', 'final warning', 'penalty fee',
    'security alert', 'deactivation notice', 'verify identity'
  ];
  urgentPatterns.forEach(pattern => {
    if (textToScan.includes(pattern)) {
      score += 20;
      triggers.push(`High Pressure Urgency: Found "${pattern}"`);
    }
  });

  // 3. Fake Invoice / Billing Phishing
  const invoicePatterns = [
    'invoice due', 'payment overdue', 'outstanding balance',
    'billing department', 'receipt invoice', 'subscription renewal',
    'order receipt', 'unrecognized payment', 'refund approved'
  ];
  invoicePatterns.forEach(pattern => {
    if (textToScan.includes(pattern)) {
      score += 15;
      triggers.push(`Invoicing Spoof: Found "${pattern}"`);
    }
  });

  // 4. Overdue Helpline/Phone Scams
  const helpLinePatterns = [
    'toll free', 'call support', 'contact agent', 'helpline',
    'customer service desk', 'dial immediately', 'refund support'
  ];
  helpLinePatterns.forEach(pattern => {
    if (textToScan.includes(pattern)) {
      score += 15;
      triggers.push(`Support Callback Request: Found "${pattern}"`);
    }
  });

  // cap score at 100
  const finalScore = Math.min(score, 100);
  const isSafe = finalScore < 40;
  
  let recommendation = 'Document passed the local anti-fraud validation. It appears secure and safe for conversion.';
  if (finalScore >= 40 && finalScore < 70) {
    recommendation = 'Warning: This document contains suspicious keywords or phrasing typical of payment redirects or automated invoices. Verify the sender identity before processing.';
  } else if (finalScore >= 70) {
    recommendation = 'Critical Threat Blocked: High confidence scam template detected! This document resembles wire-transfer redirection fraud or phishing credentials harvesting. DO NOT interact with links, emails, or phone numbers listed inside.';
  }
  
  return {
    isSafe,
    riskScore: finalScore,
    triggers,
    recommendation
  };
}
