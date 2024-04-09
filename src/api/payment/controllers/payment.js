const { type } = require("../../corp/routes/corp");

module.exports = ({ env }) => ({
  async payment(ctx) {
    const Iyzipay = require("iyzipay");
    const { v4: uuidv4 } = require("uuid");

    // Burada şirketlerinizi döndürebilirsiniz
    const id = uuidv4();
    const basketId = uuidv4();

    const {
      price,
      cardHolderName,
      cardNumber,
      expiry,
      cvv,
      registerCard,
      username,
      buyerName,
      buyerSurname,
      address,
      city,
      zipCode,
      tckn,
      gsmNumber,
      country,
    } = ctx.request.body;
    // Fetch user info
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { username },
        populate: { role: true },
      });
    if (!user) {
      return "Kullanıcı bulunamadı";
    }

    const iyzipay = new Iyzipay({
      apiKey: "sandbox-M6mv2qJLkC64w1fQkr79ZEsnWdPtT2vu",
      secretKey: "7VqmbcrxHDVXnhemffqBksnRa6HnCMHc",
      uri: "https://sandbox-api.iyzipay.com",
    });

    const parsedExpiry = expiry.split("/");
    var req = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: id,
      price: price,
      paidPrice: price,
      currency: Iyzipay.CURRENCY.TRY,
      installment: "1",
      basketId,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: {
        cardHolderName: cardHolderName,
        cardNumber: cardNumber,
        expireMonth: parsedExpiry[0],
        expireYear: "20" + parsedExpiry[1],
        cvc: cvv,
        registerCard,
      },
      buyer: {
        id: user?.id,
        name: buyerName,
        surname: buyerSurname,
        gsmNumber: "+90" + user?.phoneNumber || "+0000000000000",
        email: user.email,
        identityNumber: tckn || "11111111111",
        registrationAddress: address,
        // ip: "85.34.78.112",
        city,
        country,
        zipCode: zipCode,
      },
      shippingAddress: {
        contactName: buyerName + " " + buyerSurname,
        city,
        country,
        address,
        zipCode,
      },
      billingAddress: {
        contactName: buyerName + " " + buyerSurname,
        city,
        country,
        address,
        zipCode,
      },
      basketItems: [
        {
          id: "BI101",
          name: "Binocular",
          category1: "Collectibles",
          category2: "Accessories",
          itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
          price: price,
        },
      ],
    };
    // const user = await strapi.entityService.findOne(
    //   "plugin::users-permissions.user",
    //   1,
    //   {
    //     populate: ["role"],
    //   }
    // );

    // Kullanıcıyı bul

    // Kullanıcının rolünü güncelle

    return new Promise((resolve, reject) => {
      iyzipay.payment.create(req, async function (err, result) {
        if (err) return reject(err);
        if (result?.status === "success") {
          const updatedUser = await strapi.db
            .query("plugin::users-permissions.user")
            .update({
              where: { username: user?.username },
              populate: { role: true },
              data: { role: { id: 3 }, isSub: true },
            });
        }
        resolve(result);
      });
    });
  },

  // Diğer endpoint fonksiyonları da buraya eklenebilir
});
