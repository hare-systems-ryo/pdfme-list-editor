FROM node:18.15.0
WORKDIR /usr/app
# COPY ./.output /usr/app/.output
# COPY ./package.json /usr/app/package.json
# COPY ./_bat/startup.sh /usr/app/_bat/startup.sh
# RUN chmod 744 /usr/app/_bat/startup.sh
# CMD ["/usr/app/_bat/startup.sh"]
ENTRYPOINT ["node", ".output/server/index.mjs"]
# ENTRYPOINT["node", "test.js"]