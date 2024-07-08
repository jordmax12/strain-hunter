/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
const axios = require('axios');
const cheerio = require('cheerio');

const { DISCORD_TOKEN, DISCORD_CHANNEL_ID } = process.env;

const nonNumberValues = ['PRICELESS', 'TBA', 'N/A'];

const FURNI_NAME_ENUM = {
  BRONZE_HABBO_TROPHY: 'Bronze Habbo Trophy',
  COLA_MACHINE: 'Cola Machine',
  CLUB_SOFA: 'Club Sofa',
  DICE_MASTER: 'Dice Master',
  FF_PLASTO: 'FF Plasto',
  FF_POD: 'FF Pod',
  FF_BEAR_RUG: 'FF Bear Rug',
  GREEN_GARLAND: 'Green Garland',
  HC_SET: 'HC Set',
  IMPERIAL_TELEPORT: 'Imperial Teleport',
  MAJESTIC_CHAIR: 'Majestic Chair',
  MOCHAMASTER: 'Mochamaster',
  NORDIC_TABLE: 'Nordic Table',
  OIL_LAMP: 'Oil Lamp',
  PETAL_PATCH: 'Petal Patch',
  PURPLE_GARLAND: 'Purple Garland',
  PURPLE_PILLOW: 'Purple Pillow',
  SMALL_TICKET_BUNDLE: 'Small Ticket Bundle',
  STUDY_DESK: 'Study Desk',
  THRONE_SOFA: 'Throne Sofa',
  TUB_MASTER: 'Tub Master',
};

const EMOJI_CODES = {
  [FURNI_NAME_ENUM.THRONE_SOFA]: '1259571424222253156',
  [FURNI_NAME_ENUM.STUDY_DESK]: '1259574900625248267',
  [FURNI_NAME_ENUM.PURPLE_PILLOW]: '1259558866669142036',
  [FURNI_NAME_ENUM.SMALL_TICKET_BUNDLE]: '1259557644671254579',
  [FURNI_NAME_ENUM.OIL_LAMP]: '1259574327397847130',
  [FURNI_NAME_ENUM.NORDIC_TABLE]: '1259572668865449985',
  [FURNI_NAME_ENUM.MAJESTIC_CHAIR]: '1259573767361921075',
  [FURNI_NAME_ENUM.IMPERIAL_TELEPORT]: '1259570871614574672',
  [FURNI_NAME_ENUM.TUB_MASTER]: '1259568585060257914',
  [FURNI_NAME_ENUM.CLUB_SOFA]: '1259568010809577612',
  [FURNI_NAME_ENUM.MOCHAMASTER]: '1259569189396545640',
  [FURNI_NAME_ENUM.FF_POD]: '1259566356789985290',
  [FURNI_NAME_ENUM.GREEN_GARLAND]: '1259564809796718623',
  [FURNI_NAME_ENUM.PURPLE_GARLAND]: '1259564335999615121',
  [FURNI_NAME_ENUM.FF_BEAR_RUG]: '1259561379086733342',
  [FURNI_NAME_ENUM.DICE_MASTER]: '1259570063816790212',
  [FURNI_NAME_ENUM.BRONZE_HABBO_TROPHY]: '1259562671607386142',
  [FURNI_NAME_ENUM.COLA_MACHINE]: '1259710749115289631',
  [FURNI_NAME_ENUM.PETAL_PATCH]: '1259559721631748217',
  UNKNOWN: '1259560250881867806',
};

const FURNI_GROUPS = {
  CASINO_RARES: [
    FURNI_NAME_ENUM.CLUB_SOFA,
    FURNI_NAME_ENUM.COLA_MACHINE,
    FURNI_NAME_ENUM.PURPLE_PILLOW,
    FURNI_NAME_ENUM.PETAL_PATCH,
    FURNI_NAME_ENUM.MAJESTIC_CHAIR,
    FURNI_NAME_ENUM.THRONE_SOFA,
    FURNI_NAME_ENUM.DICE_MASTER,
  ],
  SUPER_RARES: [FURNI_NAME_ENUM.BRONZE_HABBO_TROPHY, FURNI_NAME_ENUM.SMALL_TICKET_BUNDLE],
  FF_RARES: [
    FURNI_NAME_ENUM.FF_BEAR_RUG,
    FURNI_NAME_ENUM.FF_POD,
    FURNI_NAME_ENUM.FF_PLASTO,
    FURNI_NAME_ENUM.GREEN_GARLAND,
    FURNI_NAME_ENUM.PURPLE_GARLAND,
  ],
  HC_RARES: [
    FURNI_NAME_ENUM.HC_SET,
    FURNI_NAME_ENUM.IMPERIAL_TELEPORT,
    FURNI_NAME_ENUM.MOCHAMASTER,
    FURNI_NAME_ENUM.NORDIC_TABLE,
    FURNI_NAME_ENUM.OIL_LAMP,
    FURNI_NAME_ENUM.TUB_MASTER,
    FURNI_NAME_ENUM.STUDY_DESK,
  ],
};

const furniNameNormalizer = {
  "BONNIE BLONDE'S PILLOW": FURNI_NAME_ENUM.PURPLE_PILLOW,
  'BRONZE HABBO TROPHY': FURNI_NAME_ENUM.BRONZE_HABBO_TROPHY,
  'COLA MACHINE': FURNI_NAME_ENUM.COLA_MACHINE,
  'CLUB SOFA': FURNI_NAME_ENUM.CLUB_SOFA,
  DICEMASTER: FURNI_NAME_ENUM.DICE_MASTER,
  'DICE MASTER': FURNI_NAME_ENUM.DICE_MASTER,
  'FUNKY FRIDAY CHAIR': FURNI_NAME_ENUM.FF_PLASTO,
  'FUNKY FRIDAY: POLAR RUGS': FURNI_NAME_ENUM.FF_BEAR_RUG,
  'FAUX-FUR BEAR RUG': FURNI_NAME_ENUM.FF_BEAR_RUG,
  'FUNKY FRIDAY POD': FURNI_NAME_ENUM.FF_POD,
  'FUNKY FRIDAY: PLASTO': FURNI_NAME_ENUM.FF_PLASTO,
  'HABBO COLA': FURNI_NAME_ENUM.COLA_MACHINE,
  'HC PLASTIC SET': FURNI_NAME_ENUM.HC_SET,
  'HC PLASTO SET': FURNI_NAME_ENUM.HC_SET,
  'HC SET': FURNI_NAME_ENUM.HC_SET,
  'GREEN GARLAND': FURNI_NAME_ENUM.GREEN_GARLAND,
  'IMPERIAL TELEPORT': FURNI_NAME_ENUM.IMPERIAL_TELEPORT,
  'IMPERIAL TELEPORT (SET)': FURNI_NAME_ENUM.IMPERIAL_TELEPORT,
  'IMPERIAL TELEPORTS': FURNI_NAME_ENUM.IMPERIAL_TELEPORT,
  'IMPERIAL TELEPORTS (SET)': FURNI_NAME_ENUM.IMPERIAL_TELEPORT,
  'MAJESTIC CHAIR': FURNI_NAME_ENUM.MAJESTIC_CHAIR,
  MOCHAMASTER: FURNI_NAME_ENUM.MOCHAMASTER,
  MOCHAMASTERS: FURNI_NAME_ENUM.MOCHAMASTER,
  'NORDIC TABLE': FURNI_NAME_ENUM.NORDIC_TABLE,
  'OIL LAMP': FURNI_NAME_ENUM.OIL_LAMP,
  'PETAL PATCH': FURNI_NAME_ENUM.PETAL_PATCH,
  'PURPLE GARLAND': FURNI_NAME_ENUM.PURPLE_GARLAND,
  'PURPLE VELVET PILLOW': FURNI_NAME_ENUM.PURPLE_PILLOW,
  'SMALL TICKET BUNDLE': FURNI_NAME_ENUM.SMALL_TICKET_BUNDLE,
  'SMALL TICKET BUNDLE (PH BOX)': FURNI_NAME_ENUM.SMALL_TICKET_BUNDLE,
  'STUDY DESK': FURNI_NAME_ENUM.STUDY_DESK,
  'THRONE SOFA': FURNI_NAME_ENUM.THRONE_SOFA,
  TUBMASTER: FURNI_NAME_ENUM.TUB_MASTER,
  'TUB MASTER': FURNI_NAME_ENUM.TUB_MASTER,
};

const getNormalizedName = (name) => furniNameNormalizer[name.toUpperCase()] || name;

const getTraderClubValuesData = async () => {
  const results = await axios.get('https://tc-api.serversia.com/items');

  return results.data.map(({ name, hc_val: hcValue }) => ({
    name: getNormalizedName(name),
    value: hcValue,
  }));
};

const config = {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    Referer: 'https://originvalues.com/',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },
};

const getOriginsValuesData = async () => {
  const url = 'https://originvalues.com/';

  try {
    const response = await axios.get(url, config);
    const html = response.data;
    const $ = cheerio.load(html);

    const items = [];

    // Update the selectors below based on the actual HTML structure of the site
    $('.grid-item').each((index, element) => {
      const name = $(element).find('h2').text().trim();
      const value = $(element).find('.value-item').text().trim();
      console.log(value);
      items.push({
        name: getNormalizedName(name),
        value: nonNumberValues.indexOf(value.toUpperCase()) > -1 ? value : parseFloat(value),
      });
    });

    return items;
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to scrape the data' }),
    };
  }
};

const getHabbendValuesData = async () => {
  const url = 'https://www.habbend.com/';

  try {
    const response = await axios.get(url, config);
    const html = response.data;
    const $ = cheerio.load(html);

    const items = [];

    // Update these selectors based on your inspection
    $('.card').each((index, element) => {
      const name = $(element).find('.card-header').text().trim();

      if (name && name.length > 0) {
        const value = $(element).find('.text-warning').text().trim().split(' ')[0];
        items.push({
          name: getNormalizedName(name),
          value: nonNumberValues.indexOf(value.toUpperCase()) > -1 ? value : parseFloat(value),
        });
      }
    });

    return items;
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to scrape the data' }),
    };
  }
};

const addToCombined = (source, values, combinedValues) => {
  values.forEach((item) => {
    if (!combinedValues[item.name]) {
      combinedValues[item.name] = [];
    }
    combinedValues[item.name].push({
      text: `${item.value} (${source})`,
      raw_value: item.value,
      source,
      name: item.value,
    });
  });
};

const sendDiscordMessage = async (message) => {
  const url = `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`;
  const headers = {
    Authorization: `Bot ${DISCORD_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const data = {
    embeds: [
      {
        title: 'Values',
        description: message,
      },
    ],
    color: 3447003,
  };

  try {
    await axios.post(url, data, { headers });
    console.log('Message sent');
  } catch (error) {
    console.log(JSON.stringify(error.response.data.errors));
    console.error('Error sending message:', error.response ? error.response.data : error.message);
  }
};

const formatMessage = (combinedValues) => {
  const averages = Object.keys(combinedValues).reduce((acc, name) => {
    const rawValues = combinedValues[name].map((entry) => entry.raw_value).filter((value) => typeof value === 'number'); // Ensure only numerical values are considered

    const sum = rawValues.reduce((_acc, value) => _acc + value, 0);
    const avg = rawValues.length ? (sum / rawValues.length).toFixed(2) : 'N/A';

    acc[name] = avg;

    return acc;
  }, {});

  const embedDescription = Object.keys(FURNI_GROUPS)
    .map((group) => {
      const groupItems = FURNI_GROUPS[group]
        .map((item) => {
          const emojiCode = EMOJI_CODES[item] ? EMOJI_CODES[item] : EMOJI_CODES.UNKNOWN;
          return `<:emoji_1:${emojiCode}> ${item}:\n${combinedValues[item].map(({ text }) => text).join(',\n')}\n**AVERAGE: ${averages[item] || 'N/A'}**\n\n`;
        })
        .join('\n');

      return `**${group}**\n${groupItems}`;
    })
    .join('\n\n');

  console.log(embedDescription);

  return embedDescription;
};

const handler = async () => {
  const traderClubValues = await getTraderClubValuesData();
  const originValues = await getOriginsValuesData();
  const habbendValues = await getHabbendValuesData();

  const combinedValues = {};
  console.log({
    traderClubValues,
    originValues,
    habbendValues,
  });

  addToCombined('TraderClub', traderClubValues, combinedValues);
  addToCombined('OriginValues', originValues, combinedValues);
  addToCombined('Habbend', habbendValues, combinedValues);

  console.log(combinedValues);

  const message = formatMessage(combinedValues);

  console.log(message);
  await sendDiscordMessage(message);
};

module.exports = {
  handler,
};
