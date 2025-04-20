        Api endpoints



   Users

   -GET "/users"
   -POST "/users" 
         expects {
            name,
            email
        }
   -GET by ID "/users/{id}"
   -PUT "/users/{id}"
        expects {
            name,
            email
        }

   -DELETE "/users/{id}"

   User schema
   {
    id,
    name,
    email,
    password,
    phone,
   }

   Market schema
   {
    id,
    region,
    town,
    marketName,
    products:[],
    password,
    status,
    address
   }

   Product schema
   {
    id,
    name,
    quantity,
    expireDate,
    normalPrice,
    salePrice,
    image,
   }