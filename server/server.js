const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory data for demo
let users = [{ id:1, name:'Jacob', pfp:'/pfp.jpg', points:1240 }];
let projects = [
  { id:1, owner_id:1, title:'Hack Club Site', description:'Club website redesign', status:'active', points_earned:120, image_url:'' },
  { id:2, owner_id:1, title:'Robotics', description:'Autonomous rover', status:'active', points_earned:80, image_url:'' }
];
let shop = [
  { id:1, name:'Sticker Pack', description:'Hackanomous stickers', image_url:'', cost_points:100, stock:50, more_info:'Vinyl stickers' },
  { id:2, name:'T-Shirt', description:'Club tee', image_url:'', cost_points:500, stock:10, more_info:'Sizes S-XL' }
];
let orders = [];
let announcements = [
  { id:1, title:'Welcome to Hackanomous', body:'Launch day! Join the kickoff.', created_at: new Date().toISOString() }
];

// Endpoints
app.get('/api/user/:id', (req,res) => {
  const u = users.find(x => x.id == req.params.id);
  if (!u) return res.status(404).json({error:'not found'});
  res.json(u);
});

app.get('/api/projects', (req,res) => {
  const userId = req.query.userId;
  if (userId) return res.json(projects.filter(p => p.owner_id == userId));
  res.json(projects);
});

app.get('/api/shop', (req,res) => res.json(shop));

app.get('/api/announcements', (req,res) => res.json(announcements));

app.post('/api/orders', (req,res) => {
  const { userId, shopItemId } = req.body;
  const user = users.find(u => u.id == userId);
  const item = shop.find(s => s.id == shopItemId);
  if (!user || !item) return res.status(400).json({ error: 'invalid' });
  if (item.stock <= 0) return res.status(400).json({ error: 'out of stock' });
  if (user.points < item.cost_points) return res.status(400).json({ error: 'insufficient points' });

  // Atomic-ish operation for demo
  user.points -= item.cost_points;
  item.stock -= 1;
  const order = { id: orders.length + 1, user_id: userId, shop_item_id: shopItemId, status: 'placed', created_at: new Date().toISOString() };
  orders.push(order);
  res.json(order);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Server running on', port));