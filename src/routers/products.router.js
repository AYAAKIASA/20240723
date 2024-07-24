import express from 'express';
import { Product } from '../schemas/product.schema.js';
import Joi from 'joi';

const router = express.Router();

// Joi 스키마 정의
const productSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': '상품 이름은 필수 항목입니다.',
    'any.required': '상품 이름을 입력해 주세요.'
  }),
  description: Joi.string().required().messages({
    'string.empty': '상품 설명은 필수 항목입니다.',
    'any.required': '상품 설명을 입력해 주세요.'
  }),
  manager: Joi.string().required().messages({
    'string.empty': '상품 관리자는 필수 항목입니다.',
    'any.required': '상품 관리자를 입력해 주세요.'
  }),
  password: Joi.string().required().messages({
    'string.empty': '비밀번호는 필수 항목입니다.',
    'any.required': '비밀번호를 입력해 주세요.'
  }),
  status: Joi.string().valid('FOR_SALE', 'SOLD_OUT').optional()
});

const updateSchema = Joi.object({
  name: Joi.string().optional().messages({
    'string.empty': '상품 이름은 빈 값일 수 없습니다.'
  }),
  description: Joi.string().optional().messages({
    'string.empty': '상품 설명은 빈 값일 수 없습니다.'
  }),
  manager: Joi.string().optional().messages({
    'string.empty': '상품 관리자는 빈 값일 수 없습니다.'
  }),
  status: Joi.string().valid('FOR_SALE', 'SOLD_OUT').optional().messages({
    'string.empty': '상품 상태는 빈 값일 수 없습니다.',
    'any.allowOnly': '상태는 FOR_SALE 또는 SOLD_OUT만 가능합니다.'
  }),
  password: Joi.string().required().messages({
    'string.empty': '비밀번호는 필수 항목입니다.',
    'any.required': '비밀번호를 입력해 주세요.'
  })
});

const passwordSchema = Joi.object({
  password: Joi.string().required().messages({
    'string.empty': '비밀번호는 필수 항목입니다.',
    'any.required': '비밀번호를 입력해 주세요.'
  }),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  manager: Joi.string().optional(),
  status: Joi.string().valid('FOR_SALE', 'SOLD_OUT').optional()
});

// 상품 생성 API
router.post('/', async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description, manager, password } = value;

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: '이미 등록 된 상품입니다.' });
    }

    const product = new Product({ name, description, manager, password });
    await product.save();
    res.status(201).json({
      message: '상품 생성에 성공했습니다.',
      data: product
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.' });
  }
});

// 상품 목록 조회 API
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).select('-password');
    res.status(200).json({
      message: '상품 목록 조회에 성공했습니다.',
      data: products
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.' });
  }
});

// 상품 상세 조회 API
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('-password');
    if (!product) {
      return res.status(404).json({ message: '상품이 존재하지 않습니다.' });
    }
    res.status(200).json({
      message: '상품 상세 조회에 성공했습니다.',
      data: product
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.' });
  }
});

// 상품 수정 API
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { password, ...updateData } = value;

    const product = await Product.findById(req.params.id).select('+password');
    if (!product) {
      return res.status(404).json({ message: '상품이 존재하지 않습니다.' });
    }

    if (product.password !== password) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    if (updateData.name) {
      const existingProduct = await Product.findOne({ name: updateData.name });
      if (existingProduct && existingProduct._id.toString() !== product._id.toString()) {
        return res.status(400).json({ message: '이미 등록된 상품 이름입니다.' });
      }
    }

    Object.assign(product, updateData);
    await product.save();

    res.status(200).json({
      message: '상품 수정에 성공했습니다.',
      data: product
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.' });
  }
});

// 상품 삭제 API
router.delete('/:id', async (req, res) => {
  try {
    const { error } = passwordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { password } = req.body;

    const product = await Product.findById(req.params.id).select('+password');
    if (!product) {
      return res.status(404).json({ message: '상품이 존재하지 않습니다.' });
    }

    if (product.password !== password) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({
      message: '상품 삭제에 성공했습니다.',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.' });
  }
});

export default router;
