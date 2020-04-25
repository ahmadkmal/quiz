'use strict';
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const PORT = process.env.PORT || 3000;
const superagent = require('superagent');
const methodOverride =require('method-override')
// end require

const app = express();
app.use(express.static('./public'));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
const client = new pg.Client(process.env.DATABASE_URL);

// https://eu1.locationiq.com/v1/search.php?key=${process.env.geoCode}&q=${city}&format=json
app.get('/',main);
app.post('/show',show)

function show(req,res){
    let city = req.body.search;
    const SQL = 'SELECT * FROM loca WHERE search=$1;';
    client.query(SQL,[city]).then((data)=>{
        if(data.rows.length > 0){
            console.log('from DB');
            res.render('show',{location:data.rows[0]});
        }else{
            console.log('from API',data.rows);
            let city = req.body.search;
            let URL = `https://eu1.locationiq.com/v1/search.php?key=${process.env.geoCode}&q=${city}&format=json`;
            superagent.get(URL).then((result)=>{
                let location = new Location(result.body[0])
                const {name,lon,lat} = location;
                const SQL2 = 'INSERT INTO loca (search,name,lat,lon) VALUES ($1,$2,$3,$4);';
                const val2 = [city,name,lat,lon];
                console.log('SAVING THROW DB',val2,'sql',SQL2);
                client.query(SQL2,val2).then((result)=>{
                    console.log(result);
                    res.render('show',{location:location});
                })
                
            })
            

        }
    })
   
}
function main(req,res){
    const SQL = 'SELECT * FROM loca ;';
    client.query(SQL).then((data)=>{
        console.log(data.rows);
    });
  
    // res.redirect(`https://eu1.locationiq.com/v1/search.php?key=${process.env.geoCode}&q=${city}&format=json`);
    res.render('index');
}

client.connect()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`you are listening to ${PORT} with reham`);
    })
   
})

function Location(obj){
    this.name = obj.display_name;
    this.lat = obj.lat;
    this.lon = obj.lon;
}
