node-jsondb
===========

An, extremely, light and portable CRUD json based database

use case
========

Only use when very little data needs to be stored and your app needs to be
portable. Helps in situations where setting up mongodb or other db and drivers
is overkill or unfeasable

Usage
=====
```

//Will create or load `my_database.json` in current working directory
db = require('jsondb').connect('my_database')

//To change db file location
db = require('jsondb')
db.getDB().storage('/path/to/file')

//connect or create a database
db.connect('my_database', fn)

//delete database
db.delete('my_database', fn)

//create table
db.create('table', 'my_table_name', fn)

//delete table
db.delete('table', 'my_table_name', fn)

//create field
db.create('field', {table:"my_table_name", field:"my_field"}, fn)

//delete fields
db.delete('field', {table:"my_table_name", field:"my_field"}, fn)

//add row - note the index of these must match the index of db.tables[tblname].fields
db.add(tblname, [var1, var2, var3], fn)

//delete row
db.delete('row', {table:"my_table_name", {field_name: value, field_name2: value}})



//read
db.query("select","table_name")
//is the same as
db.select("table_name")

//update, will create table_name if not exists
db.update("table_name", {field: value})
db.query("update", "table_name", {field: value})

//delete
db.delete("table_name")	//delete table
db.delete("table_name", {field: value})  //deletes row
db.delete("table_name", "field_name")	//deletes col
```

concept
=======
All querries and commands should go through the one method