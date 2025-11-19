import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

// ==================== FAQ Management ====================

/**
 * Get all FAQs with filtering and pagination
 */
export const getAllFAQs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      published,
      search
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (published !== undefined) {
      where.published = published === 'true';
    }

    if (search) {
      where.OR = [
        { question: { contains: search as string, mode: 'insensitive' } },
        { answer: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [faqs, total] = await Promise.all([
      prisma.fAQ.findMany({
        where,
        skip,
        take,
        orderBy: { order: 'asc' },
      }),
      prisma.fAQ.count({ where }),
    ]);

    res.json({
      faqs,
      pagination: {
        total,
        pages: Math.ceil(total / take),
        currentPage: parseInt(page as string),
        perPage: take,
      },
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
};

/**
 * Get FAQ by ID
 */
export const getFAQById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const faq = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!faq) {
      res.status(404).json({ error: 'FAQ not found' });
      return;
    }

    res.json(faq);
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ' });
  }
};

/**
 * Create new FAQ
 */
export const createFAQ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { question, answer, category, order, published } = req.body;

    // Get max order if not provided
    let faqOrder = order;
    if (!faqOrder) {
      const maxOrderFaq = await prisma.fAQ.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      faqOrder = (maxOrderFaq?.order || 0) + 1;
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category: category || 'General',
        order: faqOrder,
        published: published !== undefined ? published : true,
      },
    });

    res.status(201).json(faq);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
};

/**
 * Update FAQ
 */
export const updateFAQ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { question, answer, category, order, published } = req.body;

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(question !== undefined && { question }),
        ...(answer !== undefined && { answer }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order }),
        ...(published !== undefined && { published }),
      },
    });

    res.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
};

/**
 * Delete FAQ
 */
export const deleteFAQ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.fAQ.delete({
      where: { id },
    });

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
};

/**
 * Reorder FAQs
 */
export const reorderFAQs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { faqOrders } = req.body; // Array of { id, order }

    await prisma.$transaction(
      faqOrders.map((item: { id: string; order: number }) =>
        prisma.fAQ.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    res.json({ message: 'FAQs reordered successfully' });
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    res.status(500).json({ error: 'Failed to reorder FAQs' });
  }
};

// ==================== Email Template Management ====================

/**
 * Get all email templates
 */
export const getAllEmailTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, search } = req.query;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { subject: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ templates });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
};

/**
 * Get email template by ID
 */
export const getEmailTemplateById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      res.status(404).json({ error: 'Email template not found' });
      return;
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ error: 'Failed to fetch email template' });
  }
};

/**
 * Create email template
 */
export const createEmailTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, subject, body, variables } = req.body;

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        type,
        subject,
        body,
        variables: variables || [],
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({ error: 'Failed to create email template' });
  }
};

/**
 * Update email template
 */
export const updateEmailTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, subject, body, variables } = req.body;

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(subject !== undefined && { subject }),
        ...(body !== undefined && { body }),
        ...(variables !== undefined && { variables }),
      },
    });

    res.json(template);
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ error: 'Failed to update email template' });
  }
};

/**
 * Delete email template
 */
export const deleteEmailTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.emailTemplate.delete({
      where: { id },
    });

    res.json({ message: 'Email template deleted successfully' });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ error: 'Failed to delete email template' });
  }
};

// ==================== Notification Template Management ====================

/**
 * Get all notification templates
 */
export const getAllNotificationTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, search } = req.query;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { title: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.notificationTemplate.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ templates });
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    res.status(500).json({ error: 'Failed to fetch notification templates' });
  }
};

/**
 * Get notification template by ID
 */
export const getNotificationTemplateById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await prisma.notificationTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      res.status(404).json({ error: 'Notification template not found' });
      return;
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching notification template:', error);
    res.status(500).json({ error: 'Failed to fetch notification template' });
  }
};

/**
 * Create notification template
 */
export const createNotificationTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, title, message, actionUrl, variables } = req.body;

    const template = await prisma.notificationTemplate.create({
      data: {
        name,
        type,
        title,
        message,
        actionUrl,
        variables: variables || [],
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating notification template:', error);
    res.status(500).json({ error: 'Failed to create notification template' });
  }
};

/**
 * Update notification template
 */
export const updateNotificationTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, title, message, actionUrl, variables } = req.body;

    const template = await prisma.notificationTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(message !== undefined && { message }),
        ...(actionUrl !== undefined && { actionUrl }),
        ...(variables !== undefined && { variables }),
      },
    });

    res.json(template);
  } catch (error) {
    console.error('Error updating notification template:', error);
    res.status(500).json({ error: 'Failed to update notification template' });
  }
};

/**
 * Delete notification template
 */
export const deleteNotificationTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.notificationTemplate.delete({
      where: { id },
    });

    res.json({ message: 'Notification template deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification template:', error);
    res.status(500).json({ error: 'Failed to delete notification template' });
  }
};

// ==================== Static Page Content Management ====================

/**
 * Get all static pages
 */
export const getAllStaticPages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { published, search } = req.query;

    const where: any = {};

    if (published !== undefined) {
      where.published = published === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const pages = await prisma.staticPage.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ pages });
  } catch (error) {
    console.error('Error fetching static pages:', error);
    res.status(500).json({ error: 'Failed to fetch static pages' });
  }
};

/**
 * Get static page by ID
 */
export const getStaticPageById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const page = await prisma.staticPage.findUnique({
      where: { id },
    });

    if (!page) {
      res.status(404).json({ error: 'Static page not found' });
      return;
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching static page:', error);
    res.status(500).json({ error: 'Failed to fetch static page' });
  }
};

/**
 * Create static page
 */
export const createStaticPage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, slug, content, metaTitle, metaDescription, published } = req.body;

    // Check if slug already exists
    const existing = await prisma.staticPage.findUnique({
      where: { slug },
    });

    if (existing) {
      res.status(400).json({ error: 'Slug already exists' });
      return;
    }

    const page = await prisma.staticPage.create({
      data: {
        title,
        slug,
        content,
        metaTitle,
        metaDescription,
        published: published !== undefined ? published : false,
      },
    });

    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating static page:', error);
    res.status(500).json({ error: 'Failed to create static page' });
  }
};

/**
 * Update static page
 */
export const updateStaticPage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, slug, content, metaTitle, metaDescription, published } = req.body;

    // If slug is being updated, check if it already exists
    if (slug) {
      const existing = await prisma.staticPage.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existing) {
        res.status(400).json({ error: 'Slug already exists' });
        return;
      }
    }

    const page = await prisma.staticPage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(published !== undefined && { published }),
      },
    });

    res.json(page);
  } catch (error) {
    console.error('Error updating static page:', error);
    res.status(500).json({ error: 'Failed to update static page' });
  }
};

/**
 * Delete static page
 */
export const deleteStaticPage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.staticPage.delete({
      where: { id },
    });

    res.json({ message: 'Static page deleted successfully' });
  } catch (error) {
    console.error('Error deleting static page:', error);
    res.status(500).json({ error: 'Failed to delete static page' });
  }
};

// ==================== Help Documentation Management ====================

/**
 * Get all help articles
 */
export const getAllHelpArticles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, published, search } = req.query;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (published !== undefined) {
      where.published = published === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const articles = await prisma.helpArticle.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching help articles:', error);
    res.status(500).json({ error: 'Failed to fetch help articles' });
  }
};

/**
 * Get help article by ID
 */
export const getHelpArticleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const article = await prisma.helpArticle.findUnique({
      where: { id },
    });

    if (!article) {
      res.status(404).json({ error: 'Help article not found' });
      return;
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching help article:', error);
    res.status(500).json({ error: 'Failed to fetch help article' });
  }
};

/**
 * Create help article
 */
export const createHelpArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, slug, content, category, order, published } = req.body;

    // Check if slug already exists
    const existing = await prisma.helpArticle.findUnique({
      where: { slug },
    });

    if (existing) {
      res.status(400).json({ error: 'Slug already exists' });
      return;
    }

    // Get max order if not provided
    let articleOrder = order;
    if (!articleOrder) {
      const maxOrderArticle = await prisma.helpArticle.findFirst({
        where: { category },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      articleOrder = (maxOrderArticle?.order || 0) + 1;
    }

    const article = await prisma.helpArticle.create({
      data: {
        title,
        slug,
        content,
        category: category || 'General',
        order: articleOrder,
        published: published !== undefined ? published : false,
      },
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating help article:', error);
    res.status(500).json({ error: 'Failed to create help article' });
  }
};

/**
 * Update help article
 */
export const updateHelpArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, slug, content, category, order, published } = req.body;

    // If slug is being updated, check if it already exists
    if (slug) {
      const existing = await prisma.helpArticle.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existing) {
        res.status(400).json({ error: 'Slug already exists' });
        return;
      }
    }

    const article = await prisma.helpArticle.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order }),
        ...(published !== undefined && { published }),
      },
    });

    res.json(article);
  } catch (error) {
    console.error('Error updating help article:', error);
    res.status(500).json({ error: 'Failed to update help article' });
  }
};

/**
 * Delete help article
 */
export const deleteHelpArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.helpArticle.delete({
      where: { id },
    });

    res.json({ message: 'Help article deleted successfully' });
  } catch (error) {
    console.error('Error deleting help article:', error);
    res.status(500).json({ error: 'Failed to delete help article' });
  }
};

/**
 * Reorder help articles
 */
export const reorderHelpArticles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { articleOrders } = req.body; // Array of { id, order }

    await prisma.$transaction(
      articleOrders.map((item: { id: string; order: number }) =>
        prisma.helpArticle.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    res.json({ message: 'Help articles reordered successfully' });
  } catch (error) {
    console.error('Error reordering help articles:', error);
    res.status(500).json({ error: 'Failed to reorder help articles' });
  }
};

// ==================== Content Statistics ====================

/**
 * Get content statistics
 */
export const getContentStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalFAQs,
      publishedFAQs,
      totalEmailTemplates,
      totalNotificationTemplates,
      totalStaticPages,
      publishedStaticPages,
      totalHelpArticles,
      publishedHelpArticles,
    ] = await Promise.all([
      prisma.fAQ.count(),
      prisma.fAQ.count({ where: { published: true } }),
      prisma.emailTemplate.count(),
      prisma.notificationTemplate.count(),
      prisma.staticPage.count(),
      prisma.staticPage.count({ where: { published: true } }),
      prisma.helpArticle.count(),
      prisma.helpArticle.count({ where: { published: true } }),
    ]);

    res.json({
      faqs: {
        total: totalFAQs,
        published: publishedFAQs,
        draft: totalFAQs - publishedFAQs,
      },
      emailTemplates: {
        total: totalEmailTemplates,
      },
      notificationTemplates: {
        total: totalNotificationTemplates,
      },
      staticPages: {
        total: totalStaticPages,
        published: publishedStaticPages,
        draft: totalStaticPages - publishedStaticPages,
      },
      helpArticles: {
        total: totalHelpArticles,
        published: publishedHelpArticles,
        draft: totalHelpArticles - publishedHelpArticles,
      },
    });
  } catch (error) {
    console.error('Error fetching content stats:', error);
    res.status(500).json({ error: 'Failed to fetch content statistics' });
  }
};
