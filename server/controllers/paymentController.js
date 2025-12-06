const Iyzipay = require("iyzipay");
const Subscription = require("../models/Subscription");
const User = require("../config");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_URI || "https://sandbox-api.iyzipay.com",
});

const PLANS = require("../config/plans");

exports.initializeSubscription = catchAsync(async (req, res, next) => {
  const { planType, returnUrl } = req.body;
  const user = req.user;
  const selectedPlan = PLANS[planType];
  if (!selectedPlan) {
    return next(new AppError("Geçersiz plan tipi", 400));
  }

  const conversationId = `${user.id}_${Date.now()}`;
  const callbackUrl = `${process.env.API_URL}/api/payment/callback`;

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: conversationId,
    price: selectedPlan.price,
    paidPrice: selectedPlan.price,
    currency: Iyzipay.CURRENCY.TRY,
    basketId: conversationId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: callbackUrl,
    enabledInstallments: [1],
    buyer: {
      id: user.id,
      name: user.name,
      surname: user.surname,
      gsmNumber: "+905555555555",
      email: user.mail,
      identityNumber: "11111111111",
      lastLoginDate: "2024-01-01 12:00:00",
      registrationDate: "2024-01-01 12:00:00",
      registrationAddress: "Istanbul",
      ip: req.ip,
      city: "Istanbul",
      country: "Turkey",
      zipCode: "34732",
    },
    billingAddress: {
      contactName: `${user.name} ${user.surname}`,
      city: "Istanbul",
      country: "Turkey",
      address: "Istanbul",
      zipCode: "34732",
    },
    basketItems: [
      {
        id: planType,
        name: selectedPlan.name,
        category1: "Abonelik",
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: selectedPlan.price,
      },
    ],
  };

  iyzipay.checkoutFormInitialize.create(request, async (err, result) => {
    if (err) {
      return next(new AppError("Iyzico başlatılamadı: " + err.message, 500));
    }

    if (result.status !== "success") {
      return next(new AppError("Iyzico hatası: " + result.errorMessage, 400));
    }

    await Subscription.create({
      userId: user.id,
      planType: planType,
      price: selectedPlan.price,
      status: "PENDING",
      iyzicoSubscriptionReferenceCode: result.token,
      endDate: new Date(),
      returnUrl: returnUrl || null,
    });

    res.status(200).json({
      status: "success",
      checkoutFormContent: result.checkoutFormContent,
      token: result.token,
      paymentPageUrl: result.paymentPageUrl,
    });
  });
});

exports.handleCallback = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  iyzipay.checkoutForm.retrieve(
    {
      locale: Iyzipay.LOCALE.TR,
      conversationId: "123456789",
      token: token,
    },
    async (err, result) => {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

      if (
        err ||
        result.status !== "success" ||
        result.paymentStatus !== "SUCCESS"
      ) {
        return res.redirect(`${clientUrl}/payment/fail`);
      }

      // Başarılı ödeme
      const subscription = await Subscription.findOne({
        iyzicoSubscriptionReferenceCode: token,
      });

      if (subscription) {
        subscription.status = "ACTIVE";

        const plan = PLANS[subscription.planType];

        const existingSub = await Subscription.findOne({
          userId: subscription.userId,
          status: "ACTIVE",
          endDate: { $gt: new Date() },
          _id: { $ne: subscription._id },
        }).sort({ endDate: -1 });

        let effectiveStartDate = new Date();

        if (existingSub && existingSub.endDate > effectiveStartDate) {
          effectiveStartDate = new Date(existingSub.endDate);
        }

        const endDate = new Date(effectiveStartDate);
        endDate.setMonth(endDate.getMonth() + (plan ? plan.months : 1));

        subscription.endDate = endDate;
        subscription.startDate = new Date();
        await subscription.save();
      }

      let redirectUrl = `${clientUrl}/payment/success`;
      if (subscription.returnUrl) {
        redirectUrl += `?next=${encodeURIComponent(subscription.returnUrl)}`;
      }

      res.redirect(redirectUrl);
    }
  );
});

exports.getSubscriptionStatus = catchAsync(async (req, res, next) => {
  const user = req.user;

  const subscription = await Subscription.findOne({
    userId: user.id,
    status: "ACTIVE",
    endDate: { $gt: new Date() },
  }).sort({ endDate: -1 });

  res.json({
    status: "success",
    isSubscribed: !!subscription,
    subscription: subscription || null,
  });
});

exports.getPlans = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    plans: Object.values(PLANS),
  });
});
