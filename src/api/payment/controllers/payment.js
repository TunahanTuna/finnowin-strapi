const Iyzipay = require("iyzipay");
const iyzipay = new Iyzipay({
  apiKey: "mzbTIRjoVOoOcKDZFQ8AYAk8rPDGahP2",
  secretKey: "iE5mxdg5or63SX19CQ8CnxT9xxjidRl9",
  uri: "https://api.iyzipay.com",
});
module.exports = ({ env }) => ({
  async payment(ctx) {
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
          name: "Finnowin Lisans",
          category1: "Finance",
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: price,
        },
      ],
      callbackUrl: "http://localhost:1338/api/payment-finish",
    };

    return new Promise((resolve, reject) => {
      iyzipay.threedsInitialize.create(req, async function (err, result) {
        if (err) return reject(err);
        if (result?.status === "success") {
          let buff = Buffer.from(result.threeDSHtmlContent, "base64");
          const decodedString = buff.toLocaleString("utf8");
          const updatedUser = await strapi.db
            .query("plugin::users-permissions.user")
            .update({
              where: { username: user?.username },
              populate: { role: true },
              data: { conversationId: id },
            });
          resolve(decodedString);
        }
      });
    });

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
  async paymentFinish(ctx) {
    const { paymentId, conversationId, conversationData } = ctx.request.body;
    try {
      return new Promise((resolve, reject) => {
        iyzipay.threedsPayment.create(
          {
            locale: Iyzipay.LOCALE.TR,
            paymentId,
            conversationId,
            conversationData,
          },
          async (err, result) => {
            if (err) {
              reject(err);
            } else {
              if (result["status"] == "success") {
                const updatedUser = await strapi.db
                  .query("plugin::users-permissions.user")
                  .update({
                    where: { conversationId: conversationId },
                    populate: { role: true },
                    data: { role: { id: 3 }, isSub: true },
                  });
                resolve(`
              <html>
                      <head>
                      <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet">
                      </head>
                      <style>
                      body {
                      text-align: center;
                      padding: 40px 0;
                      background: #EBF0F5;
                      }
                      h1 {
                      color: #88B04B;
                      font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
                      font-weight: 900;
                      font-size: 40px;
                      margin-bottom: 10px;
                      }
                      p {
                      color: #404F5E;
                      font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
                      font-size:20px;
                      margin: 0;
                      }
                      i {
                      color: #9ABC66;
                      font-size: 100px;
                      line-height: 200px;
                      margin-left:-15px;
                      }
                      .card {
                      background: white;
                      padding: 60px;
                      border-radius: 4px;
                      box-shadow: 0 2px 3px #C8D0D8;
                      display: inline-block;
                      margin: 0 auto;
                      }
                      </style>
                      <body>
                      <div class="card">
                      <div style="border-radius:200px; height:200px; width:200px; background: #F8FAF5; margin:0 auto;">
                      <i class="checkmark">✓</i>
                      </div>
                      <h1>Başarılı</h1>
                      <p>Ödeme işleminiz başarıyla tamamlandı!</p>
                      </div>
                      </body>
                      </html>
              `);
              } else {
                resolve(result);
              }
            }
          }
        );
      });
    } catch (error) {}
  },
  // Diğer endpoint fonksiyonları da buraya eklenebilir
});
/*
 const updatedUser = await strapi.db
            .query("plugin::users-permissions.user")
            .update({
              where: { username: user?.username },
              populate: { role: true },
              data: { role: { id: 3 }, isSub: true },
            });
*/
