module.exports = {
  routes: [
    {
      method: "GET",
      path: "/corp/:symbol",
      handler: "custom.corp",
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
