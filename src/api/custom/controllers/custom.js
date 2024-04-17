module.exports = ({ env }) => ({
  async corp(ctx) {
    const { symbol } = ctx.params;

    // Burada şirketlerinizi döndürebilirsiniz
    try {
      const entry = await strapi.db
        .query("api::corp.corp")
        .findOne({
          where: { symbolName: symbol },
          populate: { excelFile: true },
        })

        .then((res) => res);
      return entry != undefined
        ? { status: true, data: entry }
        : { status: false, data: null };
    } catch (error) {
      return { status: false, data: null };
    }
  },

  // Diğer endpoint fonksiyonları da buraya eklenebilir
});
