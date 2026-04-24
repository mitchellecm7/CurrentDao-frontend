interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface TransactionData {
  sourceAccount?: string;
  destination?: string;
  amount?: number | string;
  operations?: any[];
  signatures?: any[];
  metadata?: any;
  memo?: string;
}

export const validateTransaction = async (transaction: TransactionData): Promise<ValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Basic structure validation
    validateBasicStructure(transaction, errors, warnings);
    
    // Account validation
    validateAccounts(transaction, errors, warnings);
    
    // Amount validation
    validateAmount(transaction, errors, warnings);
    
    // Operations validation
    validateOperations(transaction, errors, warnings);
    
    // Signatures validation
    validateSignatures(transaction, errors, warnings);
    
    // Security validation
    await validateSecurity(transaction, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    console.error('Transaction validation failed:', error);
    return {
      isValid: false,
      errors: ['Validation process failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
      warnings
    };
  }
};

function validateBasicStructure(transaction: TransactionData, errors: string[], warnings: string[]): void {
  if (!transaction || typeof transaction !== 'object') {
    errors.push('Transaction must be a valid object');
    return;
  }

  if (!transaction.sourceAccount) {
    errors.push('Source account is required');
  }

  if (!transaction.operations || !Array.isArray(transaction.operations)) {
    warnings.push('No operations defined or invalid operations format');
  }

  if (!transaction.signatures || !Array.isArray(transaction.signatures)) {
    warnings.push('No signatures provided');
  }
}

function validateAccounts(transaction: TransactionData, errors: string[], warnings: string[]): void {
  // Validate source account format (Stellar public key)
  if (transaction.sourceAccount) {
    if (!isValidStellarAddress(transaction.sourceAccount)) {
      errors.push('Invalid source account address format');
    }
  }

  // Validate destination account if present
  if (transaction.destination) {
    if (!isValidStellarAddress(transaction.destination)) {
      errors.push('Invalid destination account address format');
    }

    // Check for self-transfer
    if (transaction.sourceAccount === transaction.destination) {
      warnings.push('Self-transfer detected');
    }
  }
}

function validateAmount(transaction: TransactionData, errors: string[], warnings: string[]): void {
  if (transaction.amount !== undefined) {
    const amount = typeof transaction.amount === 'string' 
      ? parseFloat(transaction.amount) 
      : transaction.amount;

    if (isNaN(amount) || amount < 0) {
      errors.push('Invalid transaction amount');
    }

    if (amount === 0) {
      warnings.push('Zero amount transaction');
    }

    if (amount > 100000) {
      warnings.push('Large transaction amount detected');
    }

    // Check for precision issues
    if (amount % 0.0000001 !== 0) {
      errors.push('Amount precision exceeds Stellar limits (7 decimal places)');
    }
  }
}

function validateOperations(transaction: TransactionData, errors: string[], warnings: string[]): void {
  if (!transaction.operations || !Array.isArray(transaction.operations)) {
    return;
  }

  if (transaction.operations.length === 0) {
    errors.push('Transaction must contain at least one operation');
    return;
  }

  if (transaction.operations.length > 100) {
    errors.push('Transaction exceeds maximum operation limit (100)');
  }

  transaction.operations.forEach((operation, index) => {
    validateOperation(operation, index, errors, warnings);
  });
}

function validateOperation(operation: any, index: number, errors: string[], warnings: string[]): void {
  if (!operation || typeof operation !== 'object') {
    errors.push(`Invalid operation at index ${index}`);
    return;
  }

  if (!operation.type) {
    errors.push(`Operation type missing at index ${index}`);
    return;
  }

  // Validate specific operation types
  switch (operation.type) {
    case 'payment':
      validatePaymentOperation(operation, index, errors, warnings);
      break;
    case 'createAccount':
      validateCreateAccountOperation(operation, index, errors, warnings);
      break;
    case 'setOptions':
      validateSetOptionsOperation(operation, index, errors, warnings);
      break;
    case 'manageData':
      validateManageDataOperation(operation, index, errors, warnings);
      break;
    default:
      warnings.push(`Unknown operation type '${operation.type}' at index ${index}`);
  }
}

function validatePaymentOperation(operation: any, index: number, errors: string[], warnings: string[]): void {
  if (!operation.destination) {
    errors.push(`Payment operation missing destination at index ${index}`);
  } else if (!isValidStellarAddress(operation.destination)) {
    errors.push(`Invalid destination address in payment operation at index ${index}`);
  }

  if (operation.amount === undefined) {
    errors.push(`Payment operation missing amount at index ${index}`);
  } else {
    const amount = typeof operation.amount === 'string' 
      ? parseFloat(operation.amount) 
      : operation.amount;
    
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Invalid payment amount at index ${index}`);
    }
  }

  if (operation.asset && !isValidAsset(operation.asset)) {
    errors.push(`Invalid asset in payment operation at index ${index}`);
  }
}

function validateCreateAccountOperation(operation: any, index: number, errors: string[], warnings: string[]): void {
  if (!operation.destination) {
    errors.push(`Create account operation missing destination at index ${index}`);
  } else if (!isValidStellarAddress(operation.destination)) {
    errors.push(`Invalid destination address in create account operation at index ${index}`);
  }

  if (operation.startingBalance === undefined) {
    errors.push(`Create account operation missing starting balance at index ${index}`);
  } else {
    const balance = typeof operation.startingBalance === 'string' 
      ? parseFloat(operation.startingBalance) 
      : operation.startingBalance;
    
    if (isNaN(balance) || balance <= 0) {
      errors.push(`Invalid starting balance at index ${index}`);
    }

    if (balance < 1) {
      errors.push(`Starting balance below minimum requirement (1 XLM) at index ${index}`);
    }
  }
}

function validateSetOptionsOperation(operation: any, index: number, errors: string[], warnings: string[]): void {
  // Validate signer changes
  if (operation.signer) {
    if (!operation.signer.ed25519PublicKey || !isValidStellarAddress(operation.signer.ed25519PublicKey)) {
      errors.push(`Invalid signer public key in set options operation at index ${index}`);
    }

    if (operation.signer.weight !== undefined && (operation.signer.weight < 0 || operation.signer.weight > 255)) {
      errors.push(`Invalid signer weight in set options operation at index ${index}`);
    }
  }

  // Validate thresholds
  ['masterWeight', 'lowThreshold', 'medThreshold', 'highThreshold'].forEach(threshold => {
    if (operation[threshold] !== undefined && (operation[threshold] < 0 || operation[threshold] > 255)) {
      errors.push(`Invalid ${threshold} in set options operation at index ${index}`);
    }
  });
}

function validateManageDataOperation(operation: any, index: number, errors: string[], warnings: string[]): void {
  if (!operation.name) {
    errors.push(`Manage data operation missing name at index ${index}`);
  } else if (operation.name.length > 64) {
    errors.push(`Data name too long (max 64 bytes) at index ${index}`);
  }

  if (operation.value !== undefined && operation.value.length > 64) {
    errors.push(`Data value too long (max 64 bytes) at index ${index}`);
  }
}

function validateSignatures(transaction: TransactionData, errors: string[], warnings: string[]): void {
  if (!transaction.signatures || !Array.isArray(transaction.signatures)) {
    return;
  }

  transaction.signatures.forEach((signature, index) => {
    if (!signature || typeof signature !== 'object') {
      errors.push(`Invalid signature at index ${index}`);
      return;
    }

    if (!signature.publicKey) {
      errors.push(`Signature missing public key at index ${index}`);
    } else if (!isValidStellarAddress(signature.publicKey)) {
      errors.push(`Invalid signature public key at index ${index}`);
    }

    if (!signature.signature) {
      errors.push(`Missing signature data at index ${index}`);
    }
  });

  // Check for duplicate signatures
  const publicKeys = transaction.signatures.map(s => s.publicKey).filter(Boolean);
  const uniqueKeys = new Set(publicKeys);
  if (publicKeys.length !== uniqueKeys.size) {
    warnings.push('Duplicate signatures detected');
  }
}

async function validateSecurity(transaction: TransactionData, errors: string[], warnings: string[]): Promise<void> {
  // Check for known security issues
  await checkSecurityPatterns(transaction, errors, warnings);
  
  // Validate against common attack vectors
  validateAgainstAttackVectors(transaction, errors, warnings);
  
  // Check for compliance issues
  validateCompliance(transaction, errors, warnings);
}

async function checkSecurityPatterns(transaction: TransactionData, errors: string[], warnings: string[]): Promise<void> {
  // Check for suspicious patterns
  if (transaction.destination) {
    // Check against known blacklisted addresses
    const blacklistedAddresses = await getBlacklistedAddresses();
    if (blacklistedAddresses.includes(transaction.destination)) {
      errors.push('Destination address is on security blacklist');
    }

    // Check for newly created accounts (potential scam risk)
    if (await isNewlyCreatedAccount(transaction.destination)) {
      warnings.push('Destination account is newly created - exercise caution');
    }
  }

  // Check for unusual timing patterns
  const timestamp = transaction.metadata?.timestamp || Date.now();
  const hour = new Date(timestamp).getHours();
  if (hour >= 2 && hour <= 5) {
    warnings.push('Transaction during unusual hours - verify manually');
  }
}

function validateAgainstAttackVectors(transaction: TransactionData, errors: string[], warnings: string[]): void {
  // Check for dust attacks
  if (transaction.amount && typeof transaction.amount === 'number' && transaction.amount < 0.0000001) {
    warnings.push('Potential dust attack detected');
  }

  // Check for front-running patterns
  if (transaction.metadata?.previousTransactions && 
      transaction.metadata.previousTransactions.length > 10) {
    warnings.push('High transaction frequency - potential front-running risk');
  }

  // Check for memo abuse
  if (transaction.memo && transaction.memo.length > 28) {
    warnings.push('Long memo may indicate spam or phishing attempt');
  }
}

function validateCompliance(transaction: TransactionData, errors: string[], warnings: string[]): void {
  // Check for sanctions compliance
  if (transaction.destination) {
    // In a real implementation, this would check against sanctions lists
    const sanctionedRegions = ['sanctioned-region-1', 'sanctioned-region-2'];
    if (transaction.metadata?.region && sanctionedRegions.includes(transaction.metadata.region)) {
      errors.push('Transaction violates sanctions compliance');
    }
  }

  // Check for AML/KYC requirements
  if (transaction.amount && typeof transaction.amount === 'number' && transaction.amount > 10000) {
    warnings.push('Large transaction requires AML/KYC verification');
  }
}

// Helper functions
function isValidStellarAddress(address: string): boolean {
  // Basic Stellar public key validation
  return typeof address === 'string' && 
         address.length === 56 && 
         address.startsWith('G') &&
         /^[GABCDEFGHIJKLMNOPQRSTUVWXYZ234567]+$/.test(address);
}

function isValidAsset(asset: any): boolean {
  if (!asset || typeof asset !== 'object') {
    return false;
  }

  if (asset.type === 'native') {
    return true;
  }

  if (asset.type === 'credit_alphanum4' || asset.type === 'credit_alphanum12') {
    return !!asset.code && !!asset.issuer && isValidStellarAddress(asset.issuer);
  }

  return false;
}

async function getBlacklistedAddresses(): Promise<string[]> {
  // Mock implementation - in reality, this would fetch from a secure database
  return [
    'GBLACKLIST1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'GBLACKLIST0987654321ZYXWVUTSRQPONMLKJIHGFEDCBA'
  ];
}

async function isNewlyCreatedAccount(address: string): Promise<boolean> {
  // Mock implementation - in reality, this would check the account creation time
  return Math.random() < 0.1; // 10% chance of being newly created
}

// Additional validation utilities
export const validateMultiSigTransaction = async (transaction: TransactionData): Promise<ValidationResult> => {
  const result = await validateTransaction(transaction);
  
  // Additional multi-sig specific validations
  if (transaction.metadata?.signers) {
    const signers = transaction.metadata.signers;
    
    if (signers.length < 2) {
      result.errors.push('Multi-sig transaction requires at least 2 signers');
    }

    if (signers.length > 10) {
      result.errors.push('Multi-sig transaction exceeds maximum signer limit (10)');
    }

    const threshold = transaction.metadata.threshold || 0;
    const totalWeight = signers.reduce((sum: number, signer: any) => sum + (signer.weight || 0), 0);
    
    if (threshold > totalWeight) {
      result.errors.push('Signature threshold exceeds total signer weight');
    }

    if (threshold <= 0) {
      result.errors.push('Signature threshold must be positive');
    }
  }

  return result;
};

export const validateEmergencyCancellation = (transaction: TransactionData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!transaction.metadata?.transactionId) {
    errors.push('Transaction ID required for emergency cancellation');
  }

  if (transaction.metadata?.status === 'completed') {
    errors.push('Cannot cancel completed transaction');
  }

  if (transaction.metadata?.cancelled) {
    errors.push('Transaction already cancelled');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
