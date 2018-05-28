const { default: ApolloClient } = require("apollo-client");
const { InMemoryCache } = require("apollo-cache-inmemory");
const gql = require("graphql-tag");
const fetch = require("node-fetch");
const { createHttpLink } = require("apollo-link-http");

const uri = process.env.GC_API_URI || "http://localhost:8080/api/graphql";
const link = createHttpLink({ uri, fetch });

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

async function getGeocaches(box) {
  if (box[0] > box[2]) {
    let tmp = box[0];
    box[0] = box[2];
    box[2] = tmp;
  }

  if (box[1] > box[3]) {
    let tmp = box[1];
    box[1] = box[3];
    box[2] = tmp;
  }

  let box2 = [box[1], box[0], box[3], box[2]];

  const exclude = JSON.stringify([process.env.GC_USERNAME]);
  const query = gql`
      {
        geocaches(bbox: ${JSON.stringify(box2)}, exclude: ${exclude}) {
          gc
          parsed {
            name
            lat
            lon
          }
        }
      }
    `;
  const response = await client.query({ query });
  return response.data.geocaches;
}

module.exports = getGeocaches;
