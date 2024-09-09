const db = require("../models");
const { QueryTypes, Op } = require("sequelize");
const WebSocket = require('ws');
const axios = require('axios');
const redis = require("../config/redis");
// const Model = db.Model;
// const { Op } = require("sequelize");

exports.refactoreMe1 = async (req, res) => {
  // function ini sebenarnya adalah hasil survey dri beberapa pertnayaan, yang mana nilai dri jawaban tsb akan di store pada array seperti yang ada di dataset
  try {
    const [surveys] = await db.sequelize.query('SELECT * FROM surveys');
    const averages = surveys.map(e => {
      return e.values ? e.values.reduce((a, b) => a + b, 0) / e.values.length : 0;
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      data: averages
    });
  } catch (error) {
    console.error('Error analyzing surveys:', error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      success: false,
    });
  }
};

exports.refactoreMe2 = async (req, res) => {
  // function ini untuk menjalakan query sql insert dan mengupdate field "dosurvey" yang ada di table user menjadi true, jika melihat data yang di berikan, salah satu usernnya memiliki dosurvey dengan data false
  try {
    const { userId, values } = req.body;

    if (!userId || !values) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid Request Body",
        success: false,
      });
    }

    const checkUser = await db.sequelize.query(`SELECT * FROM users WHERE id = ${userId} LIMIT 1`);

    if (!checkUser.length) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        success: false,
      });
    }

    if (checkUser[0][0].dosurvey) {
      return res.status(400).json({
        statusCode: 400,
        message: "User has already taken the survey",
        success: false,
      });
    }

    const formattedValues = `{${values.join(',')}}`;
    await db.sequelize.query(
      `INSERT INTO surveys ("userId", "values", "createdAt", "updatedAt") VALUES (${userId}, '${formattedValues}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    );

    await db.sequelize.query(
      `UPDATE users SET "dosurvey" = true WHERE id = ${userId}`,
    )

    return res.status(200).json({
      statusCode: 200,
      success: true,
      data: "Survey sent successfully!",
    });
  } catch (error) {
    console.error('Error insert surveys:', error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      success: false,
    });
  }
};

exports.callmeWebSocket = (server) => {
  // do something
  let wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws) => {
    try {
      console.log('Client connected');

      ws.send(JSON.stringify({ message: 'connected' }));

      const fetchAndSend = async () => {
        try {
          const { data } = await axios.get('https://ltm-prod-api.radware.com/map/attacks?limit=10');

          // set to 30 data to make it faster and not heavy
          const firstThirtyData = data[0].slice(0, 30);

          const values = firstThirtyData.map(data =>
            `('${data.sourceCountry.replace(/'/g, "''")}', '${data.destinationCountry.replace(/'/g, "''")}', ${data.millisecond}, '${data.type.replace(/'/g, "''")}', '${data.weight.replace(/'/g, "''")}', '${data.attackTime}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          ).join(',');

          await db.sequelize.query(
            `INSERT INTO attackers ("sourceCountry", "destinationCountry", "millisecond", "type", "weight", "attackTime", "createdAt", "updatedAt") VALUES ${values}`,
          );

          ws.send(JSON.stringify(data));
        } catch (error) {
          console.log('Error fetching data:', error);
        }
      }

      fetchAndSend();

      const interval = setInterval(fetchAndSend, 3 * 60 * 1000);

      ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(interval);
      });

      ws.on('error', (error) => {
        console.log('WebSocket error:', error);
      });
    } catch (error) {
      console.log('Error on websocket connection:', error);
    }
  });
};

exports.getData = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type || (type !== 'destinationCountry' && type !== 'sourceCountry')) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid Request",
        success: false,
      });
    }

    const cacheKey = `data-${type}`;

    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log('Cached !!')
      return res.status(200).json({
        statusCode: 200,
        success: true,
        data: JSON.parse(cachedData),
      });
    }

    let data;

    if (type === 'destinationCountry') {
      data = await db.sequelize.query(`SELECT "destinationCountry" AS country, COUNT(*) AS COUNT FROM attackers GROUP BY "destinationCountry"`);
    } else if (type === 'sourceCountry') {
      data = await db.sequelize.query(`SELECT "sourceCountry" AS country, COUNT(*) AS COUNT FROM attackers GROUP BY "sourceCountry"`);
    }

    const label = [];
    const total = [];

    data[0].forEach((e) => {
      label.push(e.country === '  ' ? 'Unidentified Country' : e.country);
      total.push(e.count);
    })

    const response = {
      label,
      total,
    }

    await redis.set(cacheKey, JSON.stringify(response), 'EX', 60 * 3);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      data: response,
    });
  } catch (error) {
    console.log('Error on getData:', error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      success: false,
    });
  }
};
