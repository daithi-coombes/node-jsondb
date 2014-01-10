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
var db = require('jsondb')
db.connect('my_database_name')

Setup
-----
```
//change storage location (path to where database json files are stored)
db.getDB().storage('/path/to/directory')
```

Create
------
```
var db = require('jsondb')

//Will create or load `my_database.json` in current working directory
db = require('jsondb').connect('my_database')

//connect or create a database
db.connect('my_database', fn)

//create field
var query = {
	table:"my_table_name", 
	field:"my_field"
	}
db.create('field', query, fn)

//add row - note the index of these must match the index of database.tables[tblname].fields
db.add(tblname, [var1, var2, var3], fn)
```

Read
----
```
var db = require('jsondb')

//get database json
var json = require(db.getDB().database)

//query database:
//the query format is [{where: [col, val]}]
var query = [
	{where: ["id", "123456"]},
	{where: ["name", "Daithi Coombes"]}
]
db.query("my_table_name", query, fn)

Update
------
```
var db = require('jsondb')

//update a row
var query = {
	table: tblname,
	data: {
		where: ["field_1", "val4"],
		set: ["field_1", "new val"]
	}
}
db.update('row', query, fn)

//update a col name. NB Column names can only conatin a-zA-Z0-9 and underscore,
//also the must start with a letter.
var query = {
	table: tblname,
	where: ["old_col_name", "new_col_name"]
}
db.update('col', query, fn)

//update table name
db.update('table', {set: ["old_name","new_name"]}, fn)

Delete
------
//delete database
db.delete('my_database', fn)

//create table
db.create('table', 'my_table_name', fn)

//delete table
db.delete('table', 'my_table_name', fn)

//delete fields
db.delete('field', {table:"my_table_name", field:"my_field"}, fn)

//delete row
db.delete('row', {table:"my_table_name", {field_name: value, field_name2: value}})

//delete
db.delete("table_name")	//delete table
db.delete("table_name", {field: value})  //deletes row
db.delete("table_name", "field_name")	//deletes col
```

concept
=======
All querries and commands should go through the one method