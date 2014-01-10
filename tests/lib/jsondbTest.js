
var assert = require('assert'),
	fs = require('fs'),
	rewire = require('rewire'),
	database,
	db,
	dbname,
	storage,
	tblname

describe('jsondb: ', function(){

	beforeEach(function(done){

		db = require(process.cwd()+'/lib/jsondb')
		dbname = 'my_database'
		storage = './tests'
		tblname = 'foo_table'
		database = storage+'/'+dbname+'.json'

		db.setStorage(storage, function(){
			done()
		})
	})

	afterEach(function(done){

		fs.exists(database, function(exists){
			if(exists)
				db.delete('database', dbname, function(){
					done()
				})
			else
				done()
		})
	})

	it('Should create new database', function(done){

		db.connect(dbname, function(){

			fs.readFile(database, function(err, data){
				var j = JSON.parse(data)
				assert.equal(j.dbname, dbname)
				done()
			})
		})

	})

	it('Should connect to created database', function(done){
		
		//create db
		db.connect(dbname, function(){
			db.close(function(){
				db.setStorage(storage, function(){
					db.connect(dbname, function(){
						fs.exists(database, function(exists){
							if(exists)
								done()
						})
					})
				})
			})
		})
	})

	it('Should delete database', function(done){
		
		db.connect(dbname, function(){

			db.setStorage(storage)
			db.delete('database', dbname, function(){

				fs.exists(database, function(exists){
					if(!exists)
						done()
				})
			})
		})		
	})

	it('Should create and delete table', function(done){

		db.connect(dbname)
			.create('table', tblname, function(){
				
				fs.readFile(database, {encoding:'UTF8'}, function(err, data){

					var j = JSON.parse(data)
					assert.deepEqual(j, {
						    "dbname": "my_database",
						    "tables": {
						        "foo_table": {
						        	fields: [],
						        	data: []
						        }
						    }
						}
					)

					db.delete('table', tblname, function(){
						fs.readFile(database, {encoding:'UTF8'}, function(err, data){

							var j = JSON.parse(data)
							assert.deepEqual(j, {
								    "dbname": "my_database",
								    "tables": {}
								}
							)
							done()
						})
					})
				})
			})
	})
	
	it('Should add and delete fields', function(done){

		var field = 'foo_field'

		db.connect(dbname)
			.create('table', tblname, function(){
				
				//add field using string
				db.create('field', {table:tblname, field:field}, function(){
					
					var j = require(process.cwd()+'/'+database)	
					assert.equal(j.tables[tblname].fields[0], field)
					
					var foo ={
						table:tblname, 
						field: ['one','two','three']
					}

					//add field by array
					db.create('field', foo, function(){

						var j = require(process.cwd()+'/'+database)
						assert.deepEqual(["foo_field","one","two","three"], j.tables[tblname].fields)
						
						//delete field
						db.delete('field', {table:tblname, field:field}, function(){

							var j = require(process.cwd()+'/'+database)
							assert.deepEqual(j.tables[tblname].fields, foo.field)
							done()
						})
					})
					
				})
			})
	})
	
	it('Should add, delete and update rows', function(done){

		var fields = ["field_1", "field2", "field3"],
			row = ["val1", "val2", "val3"],
			row2 = ["val4", "val5", "val6"],
			row3 = ["val1", "val7", "val8"]

		db.connect(dbname)
			.create('table', tblname, function(){
				db.create('field', {table:tblname, field:fields}, function(){

					//add rows
					db.insert(tblname, row, function(){
						db.insert(tblname, row2, function(){
							db.insert(tblname, row3, function(){

								//test row inserts
								var j = require(process.cwd()+'/'+database)
								assert.deepEqual(j.tables[tblname].data, [row, row2, row3])

								var foo = {
									table: tblname,
									col: ["field_1", "val1"]
								}
								db.delete('row', foo, function(){

									//test delete rows
									var j = require(process.cwd()+'/'+database)
									assert.deepEqual(j.tables[tblname].data, [row2])

									var foo = {
										table: tblname,
										data: {
											where: ["field_1", "val4"],
											set: ["field_1", "new val"]
										}
									}
									db.update('row', foo, function(){

										var j = require(process.cwd()+'/'+database)
										assert.deepEqual(j.tables[tblname].data, [["new val", "val5", "val6"]])
										done()
									})
								})
							})
						})
					})
				})
			})
	})
})