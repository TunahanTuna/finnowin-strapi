module.exports = {
  routes: [
    {
      method: "POST",
      path: "/payment",
      handler: "payment.payment",
      config: {
        policies: [
          // point to a registered policy

          // point to a registered policy with some custom configuration

          // pass a policy implementation directly
          (policyContext, config, { strapi }) => {
            return true;
          },
        ],
      },
    },
  ],
};
