const express = require("express");
const axios = require("axios");
require("dotenv").config();
const app = express();
app.use(express.json());

require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

const EMAIL = process.env.EMAIL;

app.get("/health", (req, res) => {
    return res.status(200).json({
        is_success: true,
        official_email: EMAIL
    });
});


const fibonacci = (n) => {
    if (n < 0) throw new Error("Invalid number");
    let arr = [0, 1];
    for (let i = 2; i <= n; i++) {
        arr.push(arr[i - 1] + arr[i - 2]);
    }
    return arr.slice(0, n);
};

const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const getLCM = (arr) => {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const lcm = (a, b) => (a * b) / gcd(a, b);
    return arr.reduce((acc, val) => lcm(acc, val));
};

const getHCF = (arr) => {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    return arr.reduce((acc, val) => gcd(acc, val));
};

const askAI = async (question) => {
  try {
    const prompt = `${question}. Reply in ONE WORD only.`;

    const result = await model.generateContent(prompt);

    let text = result.response.text();

    if (!text) return "Unknown";

    return text.trim().split(" ")[0];

  } catch (err) {
    console.log("AI ERROR:", err.message);
    return "Unknown"; 
  }
};


app.post("/bfhl", async (req, res) => {
    try {
        const body = req.body;

        if (!body || Object.keys(body).length !== 1) {
            return res.status(400).json({
                is_success: false,
                official_email: EMAIL,
                error: "Exactly one key required"
            });
        }

        let data;

        if (body.fibonacci !== undefined) {
            if (typeof body.fibonacci !== "number") {
                return res.status(400).json({
                    is_success: false,
                    official_email: EMAIL,
                    error: "Fibonacci must be number"
                });
            }

            data = fibonacci(body.fibonacci);
        }

        else if (body.prime !== undefined) {
            if (!Array.isArray(body.prime)) {
                return res.status(400).json({
                    is_success: false,
                    official_email: EMAIL,
                    error: "Prime must be array"
                });
            }
            data = body.prime.filter(isPrime);
        }

        else if (body.lcm !== undefined) {
            if (!Array.isArray(body.lcm)) {
                return res.status(400).json({
                    is_success: false,
                    official_email: EMAIL,
                    error: "LCM must be array"
                });
            }

            data = getLCM(body.lcm);
        }

        else if (body.hcf !== undefined) {
            if (!Array.isArray(body.hcf)) {
                return res.status(400).json({
                    is_success: false,
                    official_email: EMAIL,
                    error: "HCF must be array"
                });
            }

            data = getHCF(body.hcf);
        }

        else if (body.AI !== undefined) {
            if (typeof body.AI !== "string") {
                return res.status(400).json({
                    is_success: false,
                    official_email: EMAIL,
                    error: "AI must be string"
                });
            }

            data = await askAI(body.AI);
        }

        else {
            return res.status(400).json({
                is_success: false,
                official_email: EMAIL,
                error: "Invalid key"
            });
        }

        return res.status(200).json({
            is_success: true,
            official_email: EMAIL,
            data
        });

    } catch (err) {
        return res.status(500).json({
            is_success: false,
            official_email: EMAIL,
            error: "Internal server error"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
