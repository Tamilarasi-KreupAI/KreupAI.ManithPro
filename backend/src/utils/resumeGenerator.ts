import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ResumeGenerationResult {
  filePath: string;
  fileName: string;
  fileSize: number;
}

/**
 * Generate a PDF resume from candidate profile data
 */
export const generateResumeFromProfile = async (userId: string): Promise<ResumeGenerationResult> => {
  // Fetch complete profile data
  let profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      workExperiences: {
        orderBy: { startDate: 'desc' },
      },
      educations: {
        orderBy: { startDate: 'desc' },
      },
      skills: {
        orderBy: { proficiencyLevel: 'desc' },
      },
      projects: {
        orderBy: { startDate: 'desc' },
      },
      certifications: {
        orderBy: { issueDate: 'desc' },
      },
    },
  });

  // Create profile if it doesn't exist
  if (!profile) {
    profile = await prisma.candidateProfile.create({
      data: {
        userId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        workExperiences: {
          orderBy: { startDate: 'desc' },
        },
        educations: {
          orderBy: { startDate: 'desc' },
        },
        skills: {
          orderBy: { proficiencyLevel: 'desc' },
        },
        projects: {
          orderBy: { startDate: 'desc' },
        },
        certifications: {
          orderBy: { issueDate: 'desc' },
        },
      },
    });
  }

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '../../uploads/resumes');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Generate unique filename
  const fileName = `resume-${userId}-${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  // Create PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  // Pipe to file
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // ===== HEADER SECTION =====
  doc.fontSize(24).font('Helvetica-Bold')
    .text(`${profile.user.firstName} ${profile.user.lastName}`, { align: 'center' });

  if (profile.headline) {
    doc.fontSize(12).font('Helvetica-Oblique')
      .text(profile.headline, { align: 'center' });
  }

  doc.moveDown(0.5);

  // Contact info
  doc.fontSize(10).font('Helvetica');
  let contactInfo = [];
  if (profile.user.email) contactInfo.push(`Email: ${profile.user.email}`);
  if (profile.user.phone) contactInfo.push(`Phone: ${profile.user.phone}`);
  if (profile.city && profile.country) {
    contactInfo.push(`Location: ${profile.city}, ${profile.country}`);
  } else if (profile.city) {
    contactInfo.push(`Location: ${profile.city}`);
  } else if (profile.country) {
    contactInfo.push(`Location: ${profile.country}`);
  }

  if (contactInfo.length > 0) {
    doc.text(contactInfo.join(' | '), { align: 'center' });
  }

  // Social Links
  let socialLinks = [];
  if (profile.linkedin) socialLinks.push(`LinkedIn: ${profile.linkedin}`);
  if (profile.github) socialLinks.push(`GitHub: ${profile.github}`);
  if (profile.website) socialLinks.push(`Website: ${profile.website}`);

  if (socialLinks.length > 0) {
    doc.text(socialLinks.join(' | '), { align: 'center' });
  }

  doc.moveDown(1);
  addHorizontalLine(doc);

  // ===== PROFESSIONAL SUMMARY =====
  if (profile.summary) {
    doc.moveDown(0.5);
    addSectionHeader(doc, 'Professional Summary');
    doc.fontSize(10).font('Helvetica')
      .text(profile.summary, { align: 'justify' });
    doc.moveDown(1);
  }

  // ===== WORK EXPERIENCE =====
  if (profile.workExperiences.length > 0) {
    addSectionHeader(doc, 'Work Experience');

    profile.workExperiences.forEach((exp, index) => {
      doc.fontSize(11).font('Helvetica-Bold')
        .text(exp.position);

      doc.fontSize(10).font('Helvetica')
        .text(`${exp.company} | ${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate!)}`);

      if (exp.location) {
        doc.text(exp.location);
      }

      if (exp.description) {
        doc.moveDown(0.3);
        doc.font('Helvetica')
          .text(exp.description, { align: 'justify' });
      }

      if (index < profile.workExperiences.length - 1) {
        doc.moveDown(0.8);
      }
    });

    doc.moveDown(1);
  }

  // ===== EDUCATION =====
  if (profile.educations.length > 0) {
    addSectionHeader(doc, 'Education');

    profile.educations.forEach((edu, index) => {
      doc.fontSize(11).font('Helvetica-Bold')
        .text(edu.degree);

      doc.fontSize(10).font('Helvetica')
        .text(`${edu.institution} | ${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate!)}`);

      if (edu.fieldOfStudy) {
        doc.text(`Field of Study: ${edu.fieldOfStudy}`);
      }

      if (edu.grade) {
        doc.text(`Grade: ${edu.grade}`);
      }

      if (edu.description) {
        doc.moveDown(0.3);
        doc.text(edu.description, { align: 'justify' });
      }

      if (index < profile.educations.length - 1) {
        doc.moveDown(0.8);
      }
    });

    doc.moveDown(1);
  }

  // ===== SKILLS =====
  if (profile.skills.length > 0) {
    addSectionHeader(doc, 'Skills');

    // Group skills by category or list all
    const skillCategories = new Map<string, string[]>();

    profile.skills.forEach(skill => {
      const category = skill.category || 'General';
      if (!skillCategories.has(category)) {
        skillCategories.set(category, []);
      }
      skillCategories.get(category)!.push(`${skill.name} (${skill.proficiencyLabel})`);
    });

    skillCategories.forEach((skills, category) => {
      if (skillCategories.size > 1) {
        doc.fontSize(10).font('Helvetica-Bold')
          .text(`${category}:`, { continued: true });
        doc.font('Helvetica').text(` ${skills.join(', ')}`);
      } else {
        doc.fontSize(10).font('Helvetica')
          .text(skills.join(', '));
      }
      doc.moveDown(0.3);
    });

    doc.moveDown(0.5);
  }

  // ===== PROJECTS =====
  if (profile.projects.length > 0) {
    addSectionHeader(doc, 'Projects');

    profile.projects.forEach((proj, index) => {
      doc.fontSize(11).font('Helvetica-Bold')
        .text(proj.name);

      if (proj.startDate) {
        doc.fontSize(10).font('Helvetica')
          .text(`${formatDate(proj.startDate)} - ${proj.current ? 'Present' : proj.endDate ? formatDate(proj.endDate) : 'Completed'}`);
      }

      if (proj.url) {
        doc.text(`URL: ${proj.url}`);
      }

      if (proj.description) {
        doc.moveDown(0.3);
        doc.text(proj.description, { align: 'justify' });
      }

      if (proj.technologies && proj.technologies.length > 0) {
        doc.moveDown(0.2);
        doc.font('Helvetica-Oblique')
          .text(`Technologies: ${proj.technologies.join(', ')}`);
      }

      if (index < profile.projects.length - 1) {
        doc.moveDown(0.8);
      }
    });

    doc.moveDown(1);
  }

  // ===== CERTIFICATIONS =====
  if (profile.certifications.length > 0) {
    addSectionHeader(doc, 'Certifications');

    profile.certifications.forEach((cert, index) => {
      doc.fontSize(10).font('Helvetica-Bold')
        .text(cert.name, { continued: true });

      doc.font('Helvetica')
        .text(` - ${cert.issuer}`);

      if (cert.issueDate) {
        doc.text(`Issued: ${formatDate(cert.issueDate)}${cert.expiryDate ? ` | Expires: ${formatDate(cert.expiryDate)}` : ' | No Expiration'}`);
      }

      if (cert.credentialId) {
        doc.text(`Credential ID: ${cert.credentialId}`);
      }

      if (cert.credentialUrl) {
        doc.text(`Verify at: ${cert.credentialUrl}`);
      }

      if (index < profile.certifications.length - 1) {
        doc.moveDown(0.5);
      }
    });

    doc.moveDown(1);
  }

  // ===== LANGUAGES =====
  if (profile.languages && profile.languages.length > 0) {
    addSectionHeader(doc, 'Languages');
    doc.fontSize(10).font('Helvetica')
      .text(profile.languages.join(', '));
    doc.moveDown(1);
  }

  // Finalize PDF
  doc.end();

  // Wait for the file to be written
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  // Get file size
  const stats = fs.statSync(filePath);

  return {
    filePath,
    fileName,
    fileSize: stats.size,
  };
};

// ===== HELPER FUNCTIONS =====

function addSectionHeader(doc: typeof PDFDocument.prototype, title: string) {
  doc.fontSize(14).font('Helvetica-Bold')
    .fillColor('#2563eb') // Blue color
    .text(title.toUpperCase());

  doc.fillColor('#000000'); // Reset to black
  doc.moveDown(0.5);
}

function addHorizontalLine(doc: typeof PDFDocument.prototype) {
  doc.strokeColor('#cccccc')
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
}

function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
