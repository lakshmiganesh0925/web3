const mongoose = require("mongoose")
const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        console.log('MongoBD Connected');
    }catch(err){
        console.log(err.message);
        process.exit(1);
    }
};

module.exports= connectDB;