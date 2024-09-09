const db = require("../models");
const { QueryTypes, Op } = require("sequelize");
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
  // Survey.create({
  //   userId: req.body.userId,
  //   values: req.body.values, // [] kirim array
  // })
  //   .then((data) => {
  //     User.update(
  //       {
  //         dosurvey: true,
  //       },
  //       {
  //         where: { id: req.body.id },
  //       }
  //     )
  //       .then(() => {
  //         console.log("success");
  //       })
  //       .catch((err) => console.log(err));

  //     res.status(201).send({
  //       statusCode: 201,
  //       message: "Survey sent successfully!",
  //       success: true,
  //       data,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.status(500).send({
  //       statusCode: 500,
  //       message: "Cannot post survey.",
  //       success: false,
  //     });
  //   });
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

exports.callmeWebSocket = (req, res) => {
  // do something
};

exports.getData = (req, res) => {
  // do something
};
