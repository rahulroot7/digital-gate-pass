const controller = {}
const { Op, where } = require('sequelize');
const ApiError = require('../../utils/ApiError')
const ApiResponse = require('../../utils/ApiResponse')
const { query, validationResult } = require('express-validator');
const { Page } = require('../../models');
const slugify = require('slugify');

controller.pageCreate = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { title, content, status } = req.body;
        const banner_image = req.file ? req.file.filename : null;
        const slug = slugify(title, { lower: true, strict: true });
        const exist = await Page.findOne({
            where: {
                title: { [Op.iLike]: title.trim() }
            }
        });
        if (exist) {
            return res.status(409).json(new ApiResponse(409, null, "Page already exists"));
        }
        const page = await Page.create({ title, slug, content, banner_image, status });
        return res.status(200).json(new ApiResponse(200, page, "Page created successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
    }
};

controller.pageDetail = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({
      where: {
        slug: { [Op.iLike]: slug }, 
        status: '1',
      }
    });
    if (!page) {
      return res.status(404).json(new ApiResponse(404, null, "Page not found"));
    }
    return res.status(200).json(new ApiResponse(200, page, "Page fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.updatePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, status } = req.body;
    const banner_image = req.file ? req.file.filename : null;
    const page = await Page.findOne({
      where: { slug: { [Op.iLike]: slug } }
    });
    if (!page) {
      return res.status(404).json(new ApiResponse(404, null, "Page not found"));
    }
    let newSlug = page.slug;
    if (title && title !== page.title) {
      newSlug = slugify(title, { lower: true, strict: true });
      const slugExists = await Page.findOne({
        where: {
          slug: newSlug,
          id: { [Op.ne]: page.id }
        }
      });
      if (slugExists) {
        return res.status(409).json(new ApiResponse(409, null, "Another page with this title already exists"));
      }
    }
    page.title = title ?? page.title;
    page.slug = newSlug;
    page.content = content ?? page.content;
    page.banner_image = banner_image ?? page.banner_image;
    page.status = status ?? page.status;
    await page.save();
    return res.status(200).json(new ApiResponse(200, page, "Page updated successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.deletePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({
      where: {
        slug: { [Op.iLike]: slug }
      }
    });
    if (!page) {
      return res.status(404).json(new ApiResponse(404, null, "Page not found"));
    }
    await page.destroy();
    return res.status(200).json(new ApiResponse(200, null, "Page deleted successfully (soft delete)"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.restorePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({
      where: { slug: { [Op.iLike]: slug } },
      paranoid: false,
    });
    if (!page) {
      return res.status(404).json(new ApiResponse(404, null, "Page not found"));
    }
    if (!page.deletedAt) {
      return res.status(400).json(new ApiResponse(400, null, "Page is not deleted"));
    }
    await page.restore();
    return res.status(200).json(new ApiResponse(200, page, "Page restored successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

module.exports = controller