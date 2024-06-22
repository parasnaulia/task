const express = require("express");
const app = express();
const cors = require("cors");
const conn = require("./Conn/Connection");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const corsOptions = {
  origin: "http://localhost:3000", // Replace with your frontend's domain
  methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow cookies (if applicable)
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
conn();
const Ecommerce = require("./Schema/Schema1");
const nodemailer = require("nodemailer");
const stripe = require("stripe")(
  "sk_test_51P3Ad8SC0KB9sqXBE5X34guYpFmnZdqaPCPMJXGmnQP48BYerPyRGkGsrVPRKjuLmnuvu9OxyTmnrFKkC4wor8qR005DdHu8a2"
);

// console.log("Sclsm");
console.log(process.env.SE);

app.get("/", (req, res) => {
  res.send("Hello From home PAge");
});
app.post("/signup", async (req, res) => {
  console.log(req.body);

  const user = new Ecommerce(req.body);
  if (req.body.Password !== req.body.CPassword) {
    res.status(400).send({ error: "PassWord are Not Matching" });
  } else {
    const token = jwt.sign(
      { email: req.body.email, name: req.body.name },
      process.env.SE
    );
    console.log("This is My Token" + token);
    res
      .status(200)
      .json({ data: req.body, jwt: token, error: "SucessFully Signed Up" });

    await user.save();
  }

  //   user = req.body;
});
app.post("/login", async (req, res) => {
  console.log(req.body);

  const data = await Ecommerce.findOne({ email: req.body.email }).select(
    "+Password"
  );
  //   console.log(data);
  if (!data) {
    console.log("data Check");
    return res.status(400).send("Something Went Wrong");
  }
  if (data.Password === req.body.Password) {
    const token = jwt.sign(
      { email: data.email, name: data.name },
      process.env.SE
    );
    console.log("This is My Token" + token);
    console.log("Login Sucessful");
    res.status(200).json({ data: data, jwt: token });
  } else {
    res.status(400).send("Something Went Wrong");
    console.log("Login Unssucessful");
  }
});
app.post("/protected", async (req, res) => {
  // console.log(req.body.jwt);
  const verification = jwt.verify(req.body.jwt, process.env.SE);
  // console.log(verification);
  const data = await Ecommerce.findOne({ email: verification.email });
  console.log(data);
  res.status(200).send(data);
});
app.post("/emailUpdate", async (req, res) => {
  const { oldEmail1, newEmail1 } = req.body;
  console.log(req.body);
  console.log(oldEmail1);
  console.log(newEmail1);
  // console.log(req.body.email);
  console.log("Email update Start Hogya Hai");
  // console.log(email);
  const data = await Ecommerce.findOneAndUpdate(
    { email: oldEmail1 }, // Use the retrieved email here
    { $set: { email: newEmail1 } },
    { new: true }
  );
  console.log(data);

  res.send({ error: "Data is Recived Finally" });
});
app.post("/mobileUpdate", async (req, res) => {
  console.log("this Mobile Gets Triggered");
  console.log(req.body);
  const { mobile, _id } = req.body;
  const data = await Ecommerce.findByIdAndUpdate(
    _id,
    { Phone: mobile },
    { new: true }
  );
  console.log(data);

  res.status(200).send({ error: "Nice mobile" });
});
app.post("/nameUpdate", async (req, res) => {
  console.log("Name Editing Starts Here");

  const { Name, _id } = req.body;
  console.log(Name);
  const data = await Ecommerce.findByIdAndUpdate(
    { _id },

    { $set: { name: Name } },
    { new: true }
  );

  console.log(data);

  res.status(200).send({ error: "Amazing" });
});
app.post("/cartData", async (req, res) => {
  // console.log("Bhai Ky Baat hai");
  // console.log(req.body);
  const { _id, ...Arr } = req.body;
  // console.log("THis is Id" + _id);
  // console.log("This is Array");
  // console.log(Arr.cardData[0]);
  try {
    const data = await Ecommerce.findByIdAndUpdate(
      // Assuming function to find and update by ID
      { _id },
      { $set: { cartItems: Arr.cardData } }
    );
    const data1 = await Ecommerce.findById({ _id: _id });
    console.log("THis is My Data 1");
    console.log(data1.cartItems);
    const ans = data1.cartItems.reduce((acc, item, index) => {
      let itemPrice = item.price * 83;
      return item.Quant * (acc + itemPrice);
    }, 0);
    console.log(ans);
    console.log(data1.cartItems.length);
    console.log("Data send To DataBAse"); // Success message, typo in "Database"
    return res.status(200).send({
      omg: "Ky BAat Hai Londe",
      price: ans,
      count: data1.cartItems.length,
    });
  } catch (e) {
    console.log("Something Went Wrong");
  }
});
app.delete("/removeData", async (req, res) => {
  // console.log("sahi h Delete Started");~~~
  // console.log(req.body._id);
  const { _id, index } = req.body;
  console.log(index);
  console.log(_id);
  // const data=await findByIdAndDelete({})
  const data = await Ecommerce.find({ _id: _id });
  // console.log(data[0].cartItems);
  let filterData = data[0].cartItems.filter((item) => {
    return item.id !== index;
  });
  // console.log("This is Filtered DAta");
  // console.log(filterData.length);
  let updateData = await Ecommerce.findByIdAndUpdate(
    { _id: _id },
    {
      cartItems: filterData,
    }
  );

  return res.status(200).send({ err: "Data is Deleted" });
});
app.post("/data1", async (req, res) => {
  console.log("This is My Data Getting");
  console.log(req.body);
  const data = await Ecommerce.findById({ _id: req.body._id });
  console.log(data);
  res.status(200).send({ Sucess: data });
});
app.post("/clearCart", async (req, res) => {
  console.log("Deleting started");
  const { _id } = req.body;
  console.log(_id);
  const data = await Ecommerce.findByIdAndUpdate(
    { _id: _id },
    { cartItems: [] },

    { new: true }
  );
  console.log(data);

  res.send({ Error: "Amazing data delete is Started" });
});

app.post("/payment", async (req, res) => {
  try {
    console.log("Payment request received");

    // Validate request body (optional but recommended)
    if (!req.body || !Array.isArray(req.body.data)) {
      return res
        .status(400)
        .send({ message: "Invalid request body: Missing or not an array" });
    }
    console.log("this is Done");
    console.log(req.body.data);

    const lineItems = req.body.data.map((product) => ({
      price_data: {
        currency: "inr", // Update with your desired currency code
        product_data: {
          name: product.title,

          // Ensure image URL is valid and accessible
        },
        unit_amount: Math.round(product.price * 100), // Convert price to cents for Stripe
      },
      quantity: product.Quant, // Ensure quantity is a valid integer
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/sucess", // Update with your actual success URL
      cancel_url: "http://localhost:3000/cancel", // Update with your actual cancel URL
    });

    console.log("Payment session created:", session.id);
    res.status(200).send({ id: session.id });
  } catch (error) {
    console.error("Error creating payment session:", error);
    res.status(500).send({ message: "Error processing payment" }); // Generic error message for security
  }
});

app.post("/mailer", async (req, res) => {
  //here we have to create a link
  // console.log("This is Req Body" + req.body);
  console.log(req.body);
  const { email } = req.body;
  const user = await Ecommerce.findOne({ email: email });
  console.log(user);
  if (!user) {
    return res.status(400).send({ Error: "No user Exist" });
  }
  // const jsonToken=jwt.sign({_id:user.id})
  const jstoken = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.SE
  );
  console.log(jstoken);
  let link = `http://localhost:3000/reset/${user._id}/${jstoken}`;
  console.log(link);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "parasnaulia88@gmail.com",
        pass: "yyxz zpqm xqcl pzeo",
      },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: {
        name: "Paras Naulia",
        address: "parasnaulia88@gmail.com",
      },
      to: user.email, // List of receivers
      subject: "Hello ✔", // Subject line
      text: link, // Plain text body
      html: ` Password Reset Link ${link}`, // HTML body
    });

    console.log("Mail sent:", info.response);
    res.status(200).send({ message: "Mail sent successfully" });
  } catch (error) {
    console.error("Error sending mail:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// app.post("/reset/:id/:token",(req,res)=>{
//   console.log(first)
// })
app.post("/reset/:id/:token", async (req, res) => {
  console.log("This is Verfying PassWord");
  console.log(req.body);
  const { PassWord, Cpassword, id, token } = req.body;

  if (PassWord !== Cpassword) {
    return res.status(400).send({ msg: "PassWord Does Not Match" });
  }

  const verification = jwt.verify(token, process.env.SE);
  console.log(verification);
  console.log("verification Completed");
  const data = await Ecommerce.findByIdAndUpdate(
    { _id: verification._id },
    { Password: PassWord, CPassword: Cpassword },
    { new: true }
  );
  console.log(data);
  console.log("Data Updated Finally");

  return res.status(200).send({ msg: "PassWord Updated" });
});

app.listen(5000, () => {
  console.log("Server is Listing");
});
