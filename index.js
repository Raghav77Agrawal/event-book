const User = require("./models/user.js");
const Events = require("./models/event.js");
const express = require('express');
const cors = require('cors');
const vt = require('./middleware/auth.js');
const sequelize = require("./db");
const Ticket = require("./models/ticket.js");
const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // allow React dev server
  credentials: true
}));
  app.post('/protected',vt,async (req,res)=>{
    console.log(req.user);
    const {name,email,uid} = req.user;
    try{
    let user = await User.findOne({where:{firebaseuid:uid}});
    if(!user){
user = await User.create({name,email,firebaseuid:uid});
    }
res.status(200).json({message:'ok'});
  }catch(e){
    console.log(e);
  }
});
app.post('/add-event',async (req,res)=>{
  const {name,description,date,time,venue,price,organizer} = req.body;
try{
  const x = await Events.create({title:name,description:description,date:date,time:time,location:venue, price:price,createdBy:organizer});

}
catch(e){

}
res.status(200).json({message:'done successfully'});
});
app.get('/view-events', async (req,res)=>{
  const [rows] = await sequelize.query("select * from events where status = 'approved'");
  res.json(rows);
});
app.get('/pending-req',async (req,res)=>{
  const [rows] = await sequelize.query("select * from events where status = 'pending'");
  res.json(rows);
})
app.get('/view-event/:id', async (req, res) => {
  const eventId = req.params.id;
  const [rows] = await sequelize.query(
    'SELECT * FROM events WHERE id = ?', {
      replacements: [eventId]
    }
  );
  if (rows.length > 0) {
    res.json(rows[0]);
  } else {
    res.status(404).json({ message: "Event not found" });
  }
});
app.post('/approve', async (req,res)=>{
await Events.update({status:"approved"},{where:{id:req.body.eventid}})
res.status(200).json({msg:"ok"});
});
app.post('/reject', async (req,res)=>{
await Events.update({status:"rejected"},{where:{id:req.body.eventid}})
res.status(200).json({msg:"ok"});
});
app.post('/bookticket',vt,async(req,res)=>{

  const {email} = req.user;
  const {eventid} = req.body;
 
  try{
    
    const ev = await Events.findOne({where:{id:eventid}});
  
    const x = await Ticket.create({eventid:eventid,email:email,price:ev.price});
    
    
res.status(200).json({ticketid:x.id});
  }catch(e){
    console.log(e);
    res.status(500).json({ticketd:'error'})
  }

});
app.get('/ticket/:id', vt, async (req, res) => {
  const ticketId = req.params.id;
  try {
    const ticket = await Ticket.findOne({
      where: { id: ticketId },
     
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    const event = await Events.findOne({where:{id:ticket.eventid}});
    res.status(200).json({
      ticketId: ticket.id,
      email: ticket.email,
      event: event,  // Includes title, date, time, etc.
      price: ticket.price,
      createdAt: ticket.createdAt
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
});
app.get('/mytickets', vt, async (req, res) => {
  const email = req.user.email;
  const tickets = await Ticket.findAll({ where: { email } });
   const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await Events.findOne({ where: { id: ticket.eventid } });
console.log(event);
        return {
          id: ticket.id,
          price: ticket.price,
          eventid: ticket.eventid,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          event:  {
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
          } 
        };
      })
    );

    res.status(200).json(enrichedTickets);
  
});

  const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});