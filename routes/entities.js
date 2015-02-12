exports.list = function(req, res){
  req.getConnection(function(err,connection){
       
      connection.query('USE athena', function(err){
        connection.query('SELECT * FROM entities',function(err,rows)     {
            
        if(err)
           console.log("Error Selecting : %s ",err );
     
            res.render('customers',{data:rows});
                           
         });
      });

     
       
    });
  
};