
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
		database = process.cwd()+'/'+storage+'/'+dbname+'.json'

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

		//test connecting
		db.connect(dbname, function(db){

			var j = require(database),
				test = { dbname: 'my_database', tables: {} }
			assert.deepEqual(j, test)
			done()
		})//end test connecting

	})

	it('Should connect to created database', function(done){
		
		//connect to new database
		db.connect(dbname, function(){
			db.close(function(){
				db.setStorage(storage, function(){

					//reconnect to database
					db.connect(dbname, function(db){
						var test = { dbname: 'my_database', tables: {} }
						assert.deepEqual(db, test)
						done()
					})//end reconnect
				})
			})
		})//end new connection
	})

	it('Should delete database', function(done){
		
		db.connect(dbname, function(){
			db.setStorage(storage)

			//test delete database
			db.delete('database', dbname, function(){

				fs.exists(database, function(exists){
					if(!exists)
						done()
				})
			})//end test delete database
		})		
	})

	it('CRUD tables', function(done){

		//test create table
		db.connect(dbname)
			.create('table', tblname, function(){
				var j = require(database)

				assert.deepEqual(j, {
					    "dbname": "my_database",
					    "tables": {
					        "foo_table": {
					        	cols: [],
					        	data: []
					        }
					    }
					}
				)//end test create table

				//test delete table
				db.delete('table', tblname, function(){

					var j = require(database)
					assert.deepEqual(j, {
						    "dbname": "my_database",
						    "tables": {}
						}
					)

					//update a table
					db.create('table', tblname, function(){
						db.update('table', {set: [tblname,"new_name"]}, function(){
							var j = require(database)

							assert.deepEqual(j.tables, {"new_name":{"cols":[],"data":[]}})
							done()
						})
					})
				})//end test delete table
			})
	})
	/**
	
	it('CRUD columns', function(done){

		var col = 'foo_field'

		db.connect(dbname)
			.create('table', tblname, function(){
				
				//add field using string
				db.create('field', {table:tblname, col:col}, function(){
					
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
	/**
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

	it('Should query database for results', function(done){

		var fields = ["field_1", "field2", "field3"],
			row = ["val1", "val2", "val3"],
			row2 = ["val4", "val5", "val6"],
			row3 = ["val1", "val7", "val8"]

		db.connect(dbname)
			.create('table', tblname, function(){
				db.create('field', {table:tblname, field:fields}, function(){

					db.insert(tblname, row, function(){
						db.insert(tblname, row2, function(){
							db.insert(tblname, row3, function(){
								db.insert(tblname, row, function(){
									db.insert(tblname, row2, function(){
										db.insert(tblname, row3, function(){

											db.query(tblname, {where:["field_1", "val4"]}, function(results){

												var test = [
													{
														"field_1" : "val4",
														"field2" : "val5",
														"field3" : "val6"
													},
													{
														"field_1" : "val4",
														"field2" : "val5",
														"field3" : "val6"
													}
												]
												assert.deepEqual(test, results)

												var data = [
													{where:["field2", "val7"]},
													{where:["field3", "val8"]}
												]
												db.query(tblname, data, function(results){

													var test = [ { field_1: 'val1', field2: 'val7', field3: 'val8' },
													{ field_1: 'val1', field2: 'val7', field3: 'val8' },
													{ field_1: 'val1', field2: 'val7', field3: 'val8' },
													{ field_1: 'val1', field2: 'val7', field3: 'val8' } ]

													assert.deepEqual(test, results)
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
			})
	})*/
})