module.exports = ({ env }) => ({
  async payment(ctx) {
    const Iyzipay = require("iyzipay");
    const { v4: uuidv4 } = require("uuid");

    // Burada şirketlerinizi döndürebilirsiniz
    const id = uuidv4();
    const { price, cardHolderName, cardNumber, expiry, cvv, registerCard } =
      ctx.request.body;
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
      basketId: "B67832",
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
        id: "BY789",
        name: "John",
        surname: "Doe",
        gsmNumber: "+905350000000",
        email: "email@email.com",
        identityNumber: "74300864791",
        lastLoginDate: "2015-10-05 12:43:35",
        registrationDate: "2013-04-21 15:12:09",
        registrationAddress:
          "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
        ip: "85.34.78.112",
        city: "Istanbul",
        country: "Turkey",
        zipCode: "34732",
      },
      shippingAddress: {
        contactName: "Jane Doe",
        city: "Istanbul",
        country: "Turkey",
        address: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
        zipCode: "34742",
      },
      billingAddress: {
        contactName: "Jane Doe",
        city: "Istanbul",
        country: "Turkey",
        address: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
        zipCode: "34742",
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

    return new Promise((resolve, reject) => {
      iyzipay.payment.create(req, async function (err, result) {
        if (err) return reject(err);

        resolve(result);
      });
    });
  },

  // Diğer endpoint fonksiyonları da buraya eklenebilir
});
