const jwt = require('jsonwebtoken')

const authentication = async function (req, res, next) {
    try {
        let authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(400).send({ status: false, Error: "Enter Token in BearerToken" });
        }

        const bearer = authHeader.split(" ");
        const bearerToken = bearer[1];
        if (!bearerToken) {
            return res.status(403).send({ status: false, message: "Token not present" });
        }

        jwt.verify(token, 'group29', function (error, decodedToken) {
            if (error && error.message === 'jwt expired') return res.status(401).send({ status: false, message: 'JWT is expired' })
            if (error) return res.status(401).send({ status: false, message: error.message })
            else {
                req.decodedToken = decodedToken
                next()
            }
        })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

// const authentication = async function (req, res, next) {
//     try {
//       let bearerHeader = req.headers["authorization"];
//       if (!bearerHeader) {
//         return res.status(400).send({status: false,Error: "Enter Token In BearerToken !!!"});
//       }
  
//       const bearer = bearerHeader.split(" ");
//       const bearerToken = bearer[1];
  
//       if (!bearerToken) {
//         return res.status(403).send({status: false,message: "invalid token"});
//       }
//       // To verify the token, we are using error handling callback function
//       jwt.verify(bearerToken, 'group29', function (err, decoded) {
//         if (err) {
//           return res.status(401).send({status: false,message: "Authentication Failed"});
//         } else {
//           req.tokenData = decoded; //Attribute to store the value of decoded token
//           next();
//         }
//       });
//     } catch (err) {
//       console.log("this error is from token validation", err.message);
//       res.status(500).send({msg: err.message});
//     }
//   };


module.exports = { authentication }