import Joi from 'joi';

const customizationSchema = Joi.object({
  photos: Joi.array()
    .items(
      Joi.object({
        asset: Joi.string().required(),
        crop: Joi.object().unknown(true),
        placement: Joi.string().allow('', null),
      })
    )
    .default([]),
  text: Joi.alternatives().try(Joi.object().unknown(true), Joi.string().allow('')),
  notes: Joi.string().allow('', null),
  options: Joi.object().unknown(true),
  slotPhotos: Joi.array()
    .items(
      Joi.object({
        asset: Joi.string().allow('', null),
        url: Joi.string().allow('', null),
        crop: Joi.object().unknown(true),
        placement: Joi.string().allow('', null),
      }).or('asset', 'url')
    )
    .default([]),
  previewUrl: Joi.string().allow('', null),
  qualityLabel: Joi.string().allow('', null),
  itemType: Joi.string().allow('', null),
}).unknown(true);

const productCartItemSchema = Joi.object({
  productId: Joi.string().required(),
  variantId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  customization: customizationSchema.default({}),
});

const godCartItemSchema = Joi.object({
  godProductId: Joi.string().required(),
  qualityOptionId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
});

const namePlateCartItemSchema = Joi.object({
  namePlateProductId: Joi.string().required(),
  qualityOptionId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  customization: customizationSchema.default({}),
});

const corporateGiftCartItemSchema = Joi.object({
  corporateGiftProductId: Joi.string().required(),
  qualityOptionId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  customization: customizationSchema.default({}),
});

const babyBirthFrameCartItemSchema = Joi.object({
  babyBirthFrameProductId: Joi.string().required(),
  qualityOptionId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  customization: customizationSchema.default({}),
});

const trophyCartItemSchema = Joi.object({
  trophyProductId: Joi.string().required(),
  qualityOptionId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  customization: customizationSchema.default({}),
});

const penPrintCartItemSchema = Joi.object({
  penPrintProductId: Joi.string().required(),
  qualityOptionId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  customization: customizationSchema.default({}),
});

const uvDtfStickerCartItemSchema = Joi.object({
  uvDtfStickerProductId: Joi.string().required(),
  qualityOptionId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  customization: customizationSchema.default({}),
});

const productLabelStickerCartItemSchema = Joi.object({
  productLabelStickerProductId: Joi.string().required(),
  qualityOptionId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  customization: customizationSchema.default({}),
});

const tShirtCartItemSchema = Joi.object({
  tShirtProductId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  customization: customizationSchema.default({}),
});

const cartItemInputSchema = Joi.alternatives().try(
  productCartItemSchema,
  godCartItemSchema,
  namePlateCartItemSchema,
  corporateGiftCartItemSchema,
  babyBirthFrameCartItemSchema,
  trophyCartItemSchema,
  penPrintCartItemSchema,
  uvDtfStickerCartItemSchema,
  productLabelStickerCartItemSchema,
  tShirtCartItemSchema,
);

export const addCartItemSchema = Joi.object({
  body: cartItemInputSchema,
  params: Joi.object(),
  query: Joi.object(),
});

export const syncCartSchema = Joi.object({
  body: Joi.object({
    items: Joi.array().items(cartItemInputSchema).min(1).required(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});

export const updateCartItemSchema = Joi.object({
  body: Joi.object({
    quantity: Joi.number().integer().min(1).required()
  }),
  params: Joi.object({ itemId: Joi.string().required() }),
  query: Joi.object()
});
