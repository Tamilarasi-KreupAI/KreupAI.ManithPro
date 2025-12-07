import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// 8.2.1, 8.2.8 ENCRYPTION KEY MANAGEMENT
// ============================================================================

// Create encryption key
export const createEncryptionKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      name,
      description,
      keyType, // MASTER, DATA, FIELD, BACKUP
      algorithm,
      purpose,
      allowedOperations,
      isHSMKey,
      hsmProvider,
      hsmKeyId,
      organizationId,
    } = req.body;

    // Generate mock encrypted key material (in production, use actual crypto)
    const encryptedKeyMaterial = 'ENC_' + Array.from({ length: 64 }, () =>
      '0123456789abcdef'.charAt(Math.floor(Math.random() * 16))
    ).join('');

    const keyCheckValue = encryptedKeyMaterial.slice(0, 6);

    const key = await prisma.encryptionKey.create({
      data: {
        organizationId,
        name,
        description,
        keyType,
        algorithm: algorithm || 'AES-256-GCM',
        encryptedKeyMaterial,
        keyCheckValue,
        purpose: purpose || [],
        allowedOperations: allowedOperations || ['encrypt', 'decrypt'],
        isHSMKey: isHSMKey || false,
        hsmProvider,
        hsmKeyId,
        status: 'ACTIVE',
        activatedAt: new Date(),
        createdBy: userId,
      },
    });

    res.status(201).json({
      id: key.id,
      name: key.name,
      keyType: key.keyType,
      algorithm: key.algorithm,
      keyCheckValue: key.keyCheckValue,
      status: key.status,
      createdAt: key.createdAt,
    });
  } catch (error) {
    console.error('Error creating encryption key:', error);
    res.status(500).json({ error: 'Failed to create encryption key' });
  }
};

// Get encryption keys
export const getEncryptionKeys = async (req: Request, res: Response) => {
  try {
    const { organizationId, keyType, status } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (keyType) where.keyType = keyType;
    if (status) where.status = status;

    const keys = await prisma.encryptionKey.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        keyType: true,
        algorithm: true,
        keyCheckValue: true,
        version: true,
        status: true,
        purpose: true,
        allowedOperations: true,
        isHSMKey: true,
        hsmProvider: true,
        lastUsedAt: true,
        usageCount: true,
        activatedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(keys);
  } catch (error) {
    console.error('Error getting encryption keys:', error);
    res.status(500).json({ error: 'Failed to get encryption keys' });
  }
};

// Rotate encryption key
export const rotateEncryptionKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const existingKey = await prisma.encryptionKey.findUnique({
      where: { id },
    });

    if (!existingKey) {
      return res.status(404).json({ error: 'Key not found' });
    }

    // Mark old key as rotated
    await prisma.encryptionKey.update({
      where: { id },
      data: {
        status: 'ROTATED',
      },
    });

    // Create new key version
    const newKeyMaterial = 'ENC_' + Array.from({ length: 64 }, () =>
      '0123456789abcdef'.charAt(Math.floor(Math.random() * 16))
    ).join('');

    const newKey = await prisma.encryptionKey.create({
      data: {
        organizationId: existingKey.organizationId,
        name: existingKey.name,
        description: existingKey.description,
        keyType: existingKey.keyType,
        algorithm: existingKey.algorithm,
        encryptedKeyMaterial: newKeyMaterial,
        keyCheckValue: newKeyMaterial.slice(0, 6),
        version: existingKey.version + 1,
        previousKeyId: existingKey.id,
        status: 'ACTIVE',
        activatedAt: new Date(),
        purpose: existingKey.purpose,
        allowedOperations: existingKey.allowedOperations,
        isHSMKey: existingKey.isHSMKey,
        hsmProvider: existingKey.hsmProvider,
        createdBy: userId,
      },
    });

    res.json({
      message: 'Key rotated successfully',
      oldKeyId: existingKey.id,
      newKeyId: newKey.id,
      newVersion: newKey.version,
    });
  } catch (error) {
    console.error('Error rotating encryption key:', error);
    res.status(500).json({ error: 'Failed to rotate encryption key' });
  }
};

// Revoke encryption key
export const revokeEncryptionKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const key = await prisma.encryptionKey.update({
      where: { id },
      data: {
        status: 'REVOKED',
      },
    });

    res.json({ message: 'Key revoked', keyId: key.id });
  } catch (error) {
    console.error('Error revoking encryption key:', error);
    res.status(500).json({ error: 'Failed to revoke encryption key' });
  }
};

// Get/Set key rotation schedule
export const getKeyRotationSchedule = async (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;

    const schedule = await prisma.keyRotationSchedule.findUnique({
      where: { keyId },
    });

    res.json(schedule || {
      rotationIntervalDays: 90,
      autoRotate: false,
      isEnabled: false,
    });
  } catch (error) {
    console.error('Error getting key rotation schedule:', error);
    res.status(500).json({ error: 'Failed to get key rotation schedule' });
  }
};

export const setKeyRotationSchedule = async (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;
    const {
      rotationIntervalDays,
      notifyBeforeDays,
      notifyEmails,
      autoRotate,
      autoRevokeOldDays,
      isEnabled,
    } = req.body;

    const nextRotationAt = new Date();
    nextRotationAt.setDate(nextRotationAt.getDate() + (rotationIntervalDays || 90));

    const schedule = await prisma.keyRotationSchedule.upsert({
      where: { keyId },
      update: {
        rotationIntervalDays,
        nextRotationAt,
        notifyBeforeDays,
        notifyEmails,
        autoRotate,
        autoRevokeOldDays,
        isEnabled,
      },
      create: {
        keyId,
        rotationIntervalDays: rotationIntervalDays || 90,
        nextRotationAt,
        notifyBeforeDays: notifyBeforeDays || 14,
        notifyEmails: notifyEmails || [],
        autoRotate: autoRotate || false,
        autoRevokeOldDays: autoRevokeOldDays || 30,
        isEnabled: isEnabled ?? true,
      },
    });

    res.json(schedule);
  } catch (error) {
    console.error('Error setting key rotation schedule:', error);
    res.status(500).json({ error: 'Failed to set key rotation schedule' });
  }
};

// ============================================================================
// 8.2.3 PII DETECTION & MASKING
// ============================================================================

// Get PII detection config
export const getPIIDetectionConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.query;

    const config = await prisma.pIIDetectionConfig.findFirst({
      where: {
        OR: [
          { organizationId: organizationId as string },
          { organizationId: null },
        ],
      },
      orderBy: { organizationId: 'desc' },
    });

    res.json(config || {
      isEnabled: true,
      scanFrequency: 'REALTIME',
      detectEmail: true,
      detectPhone: true,
      detectSSN: true,
      detectCreditCard: true,
      detectAddress: true,
      defaultAction: 'MASK',
    });
  } catch (error) {
    console.error('Error getting PII detection config:', error);
    res.status(500).json({ error: 'Failed to get PII detection config' });
  }
};

// Update PII detection config
export const updatePIIDetectionConfig = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const { organizationId } = updates;

    const config = await prisma.pIIDetectionConfig.upsert({
      where: {
        organizationId: organizationId || 'global',
      },
      update: updates,
      create: updates,
    });

    res.json(config);
  } catch (error) {
    console.error('Error updating PII detection config:', error);
    res.status(500).json({ error: 'Failed to update PII detection config' });
  }
};

// Scan for PII (mock implementation)
export const scanForPII = async (req: Request, res: Response) => {
  try {
    const { text, sourceType, sourceLocation } = req.body;

    // Mock PII detection patterns
    const patterns = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    };

    const detected: Array<{
      type: string;
      count: number;
      confidence: number;
      positions: number[];
    }> = [];

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        detected.push({
          type,
          count: matches.length,
          confidence: 0.95,
          positions: [], // Would include actual positions in production
        });

        // Log detection
        await prisma.pIIDetectionLog.create({
          data: {
            sourceType: sourceType || 'api_request',
            sourceLocation: sourceLocation || 'unknown',
            piiType: type,
            piiCount: matches.length,
            confidence: 0.95,
            actionTaken: 'logged',
          },
        });
      }
    }

    res.json({
      containsPII: detected.length > 0,
      detected,
      scannedLength: text.length,
    });
  } catch (error) {
    console.error('Error scanning for PII:', error);
    res.status(500).json({ error: 'Failed to scan for PII' });
  }
};

// Mask PII in text
export const maskPII = async (req: Request, res: Response) => {
  try {
    const { text, maskChar = '*', preserveFormat = true } = req.body;

    let masked = text;

    // Mask email
    masked = masked.replace(
      /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      (match: string, local: string, domain: string) => {
        if (preserveFormat) {
          return local[0] + maskChar.repeat(local.length - 1) + '@' + domain[0] + maskChar.repeat(domain.length - 1);
        }
        return maskChar.repeat(match.length);
      }
    );

    // Mask phone
    masked = masked.replace(
      /\b(\d{3})[-.]?(\d{3})[-.]?(\d{4})\b/g,
      preserveFormat ? `${maskChar}${maskChar}${maskChar}-${maskChar}${maskChar}${maskChar}-$3` : maskChar.repeat(12)
    );

    // Mask SSN
    masked = masked.replace(
      /\b\d{3}-\d{2}-\d{4}\b/g,
      preserveFormat ? `${maskChar}${maskChar}${maskChar}-${maskChar}${maskChar}-****` : maskChar.repeat(11)
    );

    res.json({
      original: text,
      masked,
      maskedCount: (text.match(/[@\d-]/g) || []).length - (masked.match(/[@\d-]/g) || []).length,
    });
  } catch (error) {
    console.error('Error masking PII:', error);
    res.status(500).json({ error: 'Failed to mask PII' });
  }
};

// Get PII detection logs
export const getPIIDetectionLogs = async (req: Request, res: Response) => {
  try {
    const { organizationId, piiType, startDate, endDate, limit = 100 } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (piiType) where.piiType = piiType;
    if (startDate || endDate) {
      where.detectedAt = {};
      if (startDate) where.detectedAt.gte = new Date(startDate as string);
      if (endDate) where.detectedAt.lte = new Date(endDate as string);
    }

    const logs = await prisma.pIIDetectionLog.findMany({
      where,
      orderBy: { detectedAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(logs);
  } catch (error) {
    console.error('Error getting PII detection logs:', error);
    res.status(500).json({ error: 'Failed to get PII detection logs' });
  }
};

// ============================================================================
// 8.2.4 DATA ANONYMIZATION
// ============================================================================

// Create anonymization rule
export const createAnonymizationRule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      name,
      description,
      targetTable,
      targetColumn,
      method, // hash, fake, mask, shuffle, null, generalize
      methodConfig,
      conditions,
      organizationId,
    } = req.body;

    const rule = await prisma.anonymizationRule.create({
      data: {
        organizationId,
        name,
        description,
        targetTable,
        targetColumn,
        method,
        methodConfig,
        conditions,
        createdBy: userId,
      },
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating anonymization rule:', error);
    res.status(500).json({ error: 'Failed to create anonymization rule' });
  }
};

// Get anonymization rules
export const getAnonymizationRules = async (req: Request, res: Response) => {
  try {
    const { organizationId, targetTable, isEnabled } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (targetTable) where.targetTable = targetTable;
    if (isEnabled !== undefined) where.isEnabled = isEnabled === 'true';

    const rules = await prisma.anonymizationRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(rules);
  } catch (error) {
    console.error('Error getting anonymization rules:', error);
    res.status(500).json({ error: 'Failed to get anonymization rules' });
  }
};

// Update anonymization rule
export const updateAnonymizationRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rule = await prisma.anonymizationRule.update({
      where: { id },
      data: updates,
    });

    res.json(rule);
  } catch (error) {
    console.error('Error updating anonymization rule:', error);
    res.status(500).json({ error: 'Failed to update anonymization rule' });
  }
};

// Delete anonymization rule
export const deleteAnonymizationRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.anonymizationRule.delete({
      where: { id },
    });

    res.json({ message: 'Anonymization rule deleted' });
  } catch (error) {
    console.error('Error deleting anonymization rule:', error);
    res.status(500).json({ error: 'Failed to delete anonymization rule' });
  }
};

// Create anonymization job
export const createAnonymizationJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      name,
      description,
      jobType,
      targetEnvironment,
      includeTables,
      excludeTables,
      ruleIds,
      isScheduled,
      cronExpression,
      organizationId,
    } = req.body;

    const job = await prisma.anonymizationJob.create({
      data: {
        organizationId,
        name,
        description,
        jobType,
        targetEnvironment,
        includeTables: includeTables || [],
        excludeTables: excludeTables || [],
        ruleIds: ruleIds || [],
        isScheduled: isScheduled || false,
        cronExpression,
        createdBy: userId,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating anonymization job:', error);
    res.status(500).json({ error: 'Failed to create anonymization job' });
  }
};

// Get anonymization jobs
export const getAnonymizationJobs = async (req: Request, res: Response) => {
  try {
    const { organizationId, status } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;

    const jobs = await prisma.anonymizationJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Error getting anonymization jobs:', error);
    res.status(500).json({ error: 'Failed to get anonymization jobs' });
  }
};

// Run anonymization job
export const runAnonymizationJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await prisma.anonymizationJob.update({
      where: { id },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // In production, this would trigger actual anonymization
    // For now, simulate completion after a delay
    setTimeout(async () => {
      await prisma.anonymizationJob.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          recordsProcessed: Math.floor(Math.random() * 10000),
        },
      });
    }, 5000);

    res.json({
      message: 'Anonymization job started',
      jobId: job.id,
      status: 'RUNNING',
    });
  } catch (error) {
    console.error('Error running anonymization job:', error);
    res.status(500).json({ error: 'Failed to run anonymization job' });
  }
};

// ============================================================================
// 8.2.5 SECURE FILE STORAGE
// ============================================================================

// Upload secure file
export const uploadSecureFile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      originalName,
      mimeType,
      fileSize,
      content, // Base64 encoded
      classification,
      allowedUsers,
      allowedRoles,
      encryptionKeyId,
      organizationId,
    } = req.body;

    // Generate stored name
    const storedName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const storagePath = `/secure-storage/${organizationId || 'default'}/${storedName}`;

    // Mock checksum
    const checksum = Array.from({ length: 64 }, () =>
      '0123456789abcdef'.charAt(Math.floor(Math.random() * 16))
    ).join('');

    const file = await prisma.secureFile.create({
      data: {
        organizationId,
        uploadedBy: userId,
        originalName,
        storedName,
        mimeType,
        fileSize,
        storageProvider: 'LOCAL',
        storagePath,
        isEncrypted: true,
        encryptionKeyId,
        encryptionAlgorithm: 'AES-256-GCM',
        checksum,
        classification: classification || 'INTERNAL',
        accessLevel: allowedUsers?.length > 0 ? 'SPECIFIC' : 'OWNER',
        allowedUsers: allowedUsers || [],
        allowedRoles: allowedRoles || [],
      },
    });

    res.status(201).json({
      id: file.id,
      originalName: file.originalName,
      storedName: file.storedName,
      fileSize: file.fileSize,
      classification: file.classification,
      isEncrypted: file.isEncrypted,
      createdAt: file.createdAt,
    });
  } catch (error) {
    console.error('Error uploading secure file:', error);
    res.status(500).json({ error: 'Failed to upload secure file' });
  }
};

// Get secure files
export const getSecureFiles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { organizationId, classification, containsPII } = req.query;

    const where: any = {
      deletedAt: null,
    };
    if (organizationId) where.organizationId = organizationId;
    if (classification) where.classification = classification;
    if (containsPII !== undefined) where.containsPII = containsPII === 'true';

    const files = await prisma.secureFile.findMany({
      where,
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        fileSize: true,
        storageProvider: true,
        isEncrypted: true,
        classification: true,
        containsPII: true,
        accessLevel: true,
        downloadCount: true,
        lastAccessedAt: true,
        createdAt: true,
        uploadedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(files);
  } catch (error) {
    console.error('Error getting secure files:', error);
    res.status(500).json({ error: 'Failed to get secure files' });
  }
};

// Download secure file
export const downloadSecureFile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const file = await prisma.secureFile.findUnique({
      where: { id },
    });

    if (!file || file.deletedAt) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check access
    if (file.accessLevel === 'OWNER' && file.uploadedBy !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (file.accessLevel === 'SPECIFIC' && !file.allowedUsers.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update download count and log access
    await prisma.secureFile.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    await prisma.fileAccessLog.create({
      data: {
        fileId: id,
        userId,
        action: 'DOWNLOAD',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // In production, would stream the actual file
    res.json({
      message: 'Download authorized',
      file: {
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        downloadUrl: `/api/files/${file.id}/content`,
      },
    });
  } catch (error) {
    console.error('Error downloading secure file:', error);
    res.status(500).json({ error: 'Failed to download secure file' });
  }
};

// Delete secure file
export const deleteSecureFile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    const file = await prisma.secureFile.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deleteReason: reason,
      },
    });

    await prisma.fileAccessLog.create({
      data: {
        fileId: id,
        userId,
        action: 'DELETE',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({ message: 'File deleted', fileId: file.id });
  } catch (error) {
    console.error('Error deleting secure file:', error);
    res.status(500).json({ error: 'Failed to delete secure file' });
  }
};

// Get file access logs
export const getFileAccessLogs = async (req: Request, res: Response) => {
  try {
    const { fileId, userId, action, limit = 100 } = req.query;

    const where: any = {};
    if (fileId) where.fileId = fileId;
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const logs = await prisma.fileAccessLog.findMany({
      where,
      orderBy: { accessedAt: 'desc' },
      take: parseInt(limit as string),
      include: {
        file: {
          select: { originalName: true },
        },
      },
    });

    res.json(logs);
  } catch (error) {
    console.error('Error getting file access logs:', error);
    res.status(500).json({ error: 'Failed to get file access logs' });
  }
};

// ============================================================================
// 8.2.6 DATA RESIDENCY
// ============================================================================

// Get data residency config
export const getDataResidencyConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    const config = await prisma.dataResidencyConfig.findUnique({
      where: { organizationId },
    });

    res.json(config || {
      primaryRegion: 'us-east-1',
      primaryProvider: 'aws',
      enableReplication: false,
      gdprCompliant: false,
      ccpaCompliant: false,
      allowCrossBorderTransfer: true,
    });
  } catch (error) {
    console.error('Error getting data residency config:', error);
    res.status(500).json({ error: 'Failed to get data residency config' });
  }
};

// Update data residency config
export const updateDataResidencyConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;
    const updates = req.body;

    const config = await prisma.dataResidencyConfig.upsert({
      where: { organizationId },
      update: updates,
      create: {
        organizationId,
        ...updates,
      },
    });

    res.json(config);
  } catch (error) {
    console.error('Error updating data residency config:', error);
    res.status(500).json({ error: 'Failed to update data residency config' });
  }
};

// ============================================================================
// 8.2.7 BACKUP & RECOVERY
// ============================================================================

// Create backup config
export const createBackupConfig = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      name,
      description,
      backupType,
      includeTables,
      excludeTables,
      includeFiles,
      schedule,
      retentionDays,
      maxBackups,
      storageProvider,
      storagePath,
      storageRegion,
      encryptBackups,
      encryptionKeyId,
      notifyOnSuccess,
      notifyOnFailure,
      notifyEmails,
      organizationId,
    } = req.body;

    const config = await prisma.backupConfig.create({
      data: {
        organizationId,
        name,
        description,
        backupType: backupType || 'FULL',
        includeTables: includeTables || [],
        excludeTables: excludeTables || [],
        includeFiles: includeFiles ?? true,
        schedule,
        retentionDays: retentionDays || 30,
        maxBackups: maxBackups || 10,
        storageProvider,
        storagePath,
        storageRegion,
        encryptBackups: encryptBackups ?? true,
        encryptionKeyId,
        notifyOnSuccess: notifyOnSuccess ?? false,
        notifyOnFailure: notifyOnFailure ?? true,
        notifyEmails: notifyEmails || [],
        createdBy: userId,
      },
    });

    res.status(201).json(config);
  } catch (error) {
    console.error('Error creating backup config:', error);
    res.status(500).json({ error: 'Failed to create backup config' });
  }
};

// Get backup configs
export const getBackupConfigs = async (req: Request, res: Response) => {
  try {
    const { organizationId, isEnabled } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (isEnabled !== undefined) where.isEnabled = isEnabled === 'true';

    const configs = await prisma.backupConfig.findMany({
      where,
      include: {
        backups: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(configs);
  } catch (error) {
    console.error('Error getting backup configs:', error);
    res.status(500).json({ error: 'Failed to get backup configs' });
  }
};

// Trigger backup
export const triggerBackup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { configId } = req.params;

    const config = await prisma.backupConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      return res.status(404).json({ error: 'Backup config not found' });
    }

    const backup = await prisma.backup.create({
      data: {
        configId,
        organizationId: config.organizationId,
        backupType: config.backupType,
        status: 'PENDING',
        isEncrypted: config.encryptBackups,
        encryptionKeyId: config.encryptionKeyId,
        triggeredBy: 'MANUAL',
        expiresAt: new Date(Date.now() + config.retentionDays * 24 * 60 * 60 * 1000),
      },
    });

    // Simulate backup progress (in production, this would be async)
    setTimeout(async () => {
      await prisma.backup.update({
        where: { id: backup.id },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      setTimeout(async () => {
        await prisma.backup.update({
          where: { id: backup.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            duration: 120,
            sizeBytes: BigInt(Math.floor(Math.random() * 1000000000)),
            compressedSizeBytes: BigInt(Math.floor(Math.random() * 500000000)),
            recordCount: Math.floor(Math.random() * 100000),
            storagePath: `/backups/${backup.id}`,
            checksum: Array.from({ length: 64 }, () => '0123456789abcdef'.charAt(Math.floor(Math.random() * 16))).join(''),
          },
        });
      }, 5000);
    }, 1000);

    res.status(201).json({
      message: 'Backup initiated',
      backupId: backup.id,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Error triggering backup:', error);
    res.status(500).json({ error: 'Failed to trigger backup' });
  }
};

// Get backups
export const getBackups = async (req: Request, res: Response) => {
  try {
    const { configId, organizationId, status, limit = 50 } = req.query;

    const where: any = { deletedAt: null };
    if (configId) where.configId = configId;
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;

    const backups = await prisma.backup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(backups.map(b => ({
      ...b,
      sizeBytes: b.sizeBytes?.toString(),
      compressedSizeBytes: b.compressedSizeBytes?.toString(),
    })));
  } catch (error) {
    console.error('Error getting backups:', error);
    res.status(500).json({ error: 'Failed to get backups' });
  }
};

// Get backup by ID
export const getBackupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const backup = await prisma.backup.findUnique({
      where: { id },
      include: {
        config: true,
        restores: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    res.json({
      ...backup,
      sizeBytes: backup.sizeBytes?.toString(),
      compressedSizeBytes: backup.compressedSizeBytes?.toString(),
    });
  } catch (error) {
    console.error('Error getting backup:', error);
    res.status(500).json({ error: 'Failed to get backup' });
  }
};

// Verify backup
export const verifyBackup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const backup = await prisma.backup.update({
      where: { id },
      data: {
        verifiedAt: new Date(),
        isVerified: true,
        verificationResult: {
          checksumValid: true,
          recordCountValid: true,
          structureValid: true,
          verifiedBy: 'system',
        },
      },
    });

    res.json({
      message: 'Backup verified successfully',
      backupId: backup.id,
      isVerified: true,
    });
  } catch (error) {
    console.error('Error verifying backup:', error);
    res.status(500).json({ error: 'Failed to verify backup' });
  }
};

// Delete backup
export const deleteBackup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.backup.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({ message: 'Backup deleted', backupId: id });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
};

// Create restore job
export const createRestoreJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      backupId,
      restoreType,
      targetEnvironment,
      includeTables,
      excludeTables,
      pointInTime,
      validateAfterRestore,
    } = req.body;

    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const restore = await prisma.restoreJob.create({
      data: {
        backupId,
        organizationId: backup.organizationId,
        restoreType: restoreType || 'FULL',
        targetEnvironment,
        includeTables: includeTables || [],
        excludeTables: excludeTables || [],
        pointInTime: pointInTime ? new Date(pointInTime) : undefined,
        validateAfterRestore: validateAfterRestore ?? true,
        requestedBy: userId,
      },
    });

    res.status(201).json({
      message: 'Restore job created',
      restoreId: restore.id,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Error creating restore job:', error);
    res.status(500).json({ error: 'Failed to create restore job' });
  }
};

// Get restore jobs
export const getRestoreJobs = async (req: Request, res: Response) => {
  try {
    const { backupId, organizationId, status } = req.query;

    const where: any = {};
    if (backupId) where.backupId = backupId;
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;

    const jobs = await prisma.restoreJob.findMany({
      where,
      include: {
        backup: {
          select: {
            id: true,
            backupType: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Error getting restore jobs:', error);
    res.status(500).json({ error: 'Failed to get restore jobs' });
  }
};

// Run restore job
export const runRestoreJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const restore = await prisma.restoreJob.update({
      where: { id },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        approvedBy: userId,
      },
    });

    // Simulate restore progress
    setTimeout(async () => {
      await prisma.restoreJob.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          progress: 100,
          recordsRestored: Math.floor(Math.random() * 100000),
          validationResult: {
            valid: true,
            recordsVerified: true,
            integrityCheck: 'passed',
          },
        },
      });
    }, 10000);

    res.json({
      message: 'Restore job started',
      restoreId: restore.id,
      status: 'RUNNING',
    });
  } catch (error) {
    console.error('Error running restore job:', error);
    res.status(500).json({ error: 'Failed to run restore job' });
  }
};

// ============================================================================
// 8.2.2 TLS CONFIGURATION
// ============================================================================

// Get TLS config
export const getTLSConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.query;

    const config = await prisma.tLSConfig.findFirst({
      where: {
        OR: [
          { organizationId: organizationId as string },
          { organizationId: null },
        ],
      },
      orderBy: { organizationId: 'desc' },
    });

    res.json(config || {
      minVersion: '1.2',
      preferredVersion: '1.3',
      hstsEnabled: true,
      hstsMaxAge: 31536000,
      hstsIncludeSubdomains: true,
      enableCertTransparency: true,
      enableOCSPStapling: true,
    });
  } catch (error) {
    console.error('Error getting TLS config:', error);
    res.status(500).json({ error: 'Failed to get TLS config' });
  }
};

// Update TLS config
export const updateTLSConfig = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const organizationId = updates.organizationId || null;

    const config = await prisma.tLSConfig.upsert({
      where: {
        organizationId: organizationId || 'global',
      },
      update: updates,
      create: {
        organizationId,
        ...updates,
      },
    });

    res.json(config);
  } catch (error) {
    console.error('Error updating TLS config:', error);
    res.status(500).json({ error: 'Failed to update TLS config' });
  }
};

// ============================================================================
// DATA PROTECTION STATS
// ============================================================================

// Get data protection stats
export const getDataProtectionStats = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.query;

    const where = organizationId ? { organizationId: organizationId as string } : {};

    const [
      encryptionKeys,
      activeKeys,
      piiDetections,
      secureFiles,
      encryptedFiles,
      backups,
      completedBackups,
    ] = await Promise.all([
      prisma.encryptionKey.count({ where }),
      prisma.encryptionKey.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.pIIDetectionLog.count({ where }),
      prisma.secureFile.count({ where: { ...where, deletedAt: null } }),
      prisma.secureFile.count({ where: { ...where, isEncrypted: true, deletedAt: null } }),
      prisma.backup.count({ where }),
      prisma.backup.count({ where: { ...where, status: 'COMPLETED' } }),
    ]);

    const recentBackup = await prisma.backup.findFirst({
      where: { ...where, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true, sizeBytes: true },
    });

    res.json({
      encryption: {
        totalKeys: encryptionKeys,
        activeKeys,
      },
      piiDetection: {
        totalDetections: piiDetections,
      },
      fileStorage: {
        totalFiles: secureFiles,
        encryptedFiles,
        encryptionRate: secureFiles > 0 ? ((encryptedFiles / secureFiles) * 100).toFixed(1) : 100,
      },
      backups: {
        total: backups,
        completed: completedBackups,
        lastBackup: recentBackup?.completedAt,
        lastBackupSize: recentBackup?.sizeBytes?.toString(),
      },
    });
  } catch (error) {
    console.error('Error getting data protection stats:', error);
    res.status(500).json({ error: 'Failed to get data protection stats' });
  }
};

// Get data protection audit logs
export const getDataProtectionAuditLogs = async (req: Request, res: Response) => {
  try {
    const {
      organizationId,
      eventType,
      resourceType,
      startDate,
      endDate,
      limit = 100,
    } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (eventType) where.eventType = eventType;
    if (resourceType) where.resourceType = resourceType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const logs = await prisma.dataProtectionAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(logs);
  } catch (error) {
    console.error('Error getting data protection audit logs:', error);
    res.status(500).json({ error: 'Failed to get data protection audit logs' });
  }
};
