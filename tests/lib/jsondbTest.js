
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

		var _done = done

		db = require(process.cwd()+'/lib/jsondb')
		dbname = 'my_database'
		storage = './tests'
		tblname = 'foo_table'
		database = process.cwd()+'/'+storage+'/'+dbname+'.json'

		db.setStorage(storage, function(){
			_done()
		})
	})

	afterEach(function(done){

		var _done = done

		fs.exists(database, function(exists){
			if(exists)
				db.delete('database', dbname, function(){
					_done()
				})
			else
				_done()
		})
	})
	
	it('CRUD database', function(done){
		
		//create database
		db.connect(dbname, function(){
			db.setStorage(storage)

			fs.exists(db.getDB().getDBLocation(dbname), function(exists){

				assert(exists, true)

				//read database
				db.getJSON(function(actual){

					var test = {
						dbname: dbname,
						tables: {}
					}
					assert.deepEqual(actual, test)

					//update database
					var test = 'new_db_name'
					db.update('database', 'new_db_name', function(){

						var new_location = db.getDB().getDBLocation(test)
						fs.exists(new_location, function(exists){

							assert(exists, true)

							//delete database
							db.delete('database', test, function(){

								fs.exists(database, function(exists){
									if(!exists)
										done()
								})
							})//end delete database
						})
					})//end update database
				})//end read database
			})
		})//end create database
	})

	it('CRUD tables', function(done){

		//create table
		db.connect(dbname)
			.create('table', tblname, function(){
				db.getJSON(function(j){
					assert.deepEqual(j, {
						    "dbname": "my_database",
						    "tables": {
						        "foo_table": {
						        	cols: [],
						        	data: []
						        }
						    }
						}
					)//create table

					//read table
					db.query(tblname, null, function(actual){

						//delete table
						db.delete('table', tblname, function(){

							db.getJSON(function(j){
								assert.deepEqual(j, {
									    "dbname": "my_database",
									    "tables": {}
									}
								)

								//update a table
								db.create('table', tblname, function(){
									db.update('table', {set: [tblname,"new_name"]}, function(){
										db.getJSON(function(j){
											assert.deepEqual(j.tables, {"new_name":{"cols":[],"data":[]}})
											done()
										})
									})//end update table
								})
							})
						})//end test delete table
					})
				})
			})
	})
	
	it('CRUD columns', function(done){

		db.connect(dbname)
			.create('table', tblname, function(){

				//add col using string
				var col = 'foo_col'
				db.create('col', {table:tblname, col:col}, function(){
					db.getJSON(function(j){

						assert.equal(j.tables[tblname].cols[0], col)
						
						var foo ={
							table:tblname, 
							col: ['one','two','three']
						}

						//add cols by array
						db.create('col', foo, function(){
							db.getJSON(function(j){
								
								assert.deepEqual(["foo_col","one","two","three"], j.tables[tblname].cols)
								
								var row = ['foo row', 'row one', 'row two', 'row three'],
									data = []
								for (var i = 0; i < 7; i++)
									data.push(row)

								j.tables[tblname].data = data
								db.getDB().setJSON(j, function(){

									//delete col
									db.delete('col', {table:tblname, col:col}, function(){
										db.getJSON(function(j){

											var foo ={
												table:tblname, 
												col: ['one','two','three']
											}

											assert.deepEqual(j.tables[tblname].cols, foo.col)
											assert.deepEqual(j.tables[tblname].data, [ [ 'row one', 'row two', 'row three' ],
												[ 'row one', 'row two', 'row three' ],
												[ 'row one', 'row two', 'row three' ],
												[ 'row one', 'row two', 'row three' ],
												[ 'row one', 'row two', 'row three' ],
												[ 'row one', 'row two', 'row three' ],
												[ 'row one', 'row two', 'row three' ] 
											])

											var foo = {
												table: tblname,
												set: ["two", "new_col"]
											}
											db.update('col', foo, function(){
												db.getJSON(function(j){

													assert.deepEqual(j.tables[tblname].cols, [ 'one', 'new_col', 'three' ])
													done()
												})
											})//end update col
										})
									})//end delete col
								})
							})
						})//end create col

					})					
				})//end create col
			})//end create table
	})
	
	it('CRUD rows', function(done){

		var cols = ["field_1", "field2", "field3"],
			row = ["val1", "val2", "val3"],
			row2 = ["val4", "val5", "val6"],
			row3 = ["val1", "val7", "val8"]

		db.connect(dbname)
			.create('table', tblname, function(){
				db.create('col', {table:tblname, col:cols}, function(){

					//add rows
					db.insert(tblname, row, function(){
						db.insert(tblname, row2, function(){
							db.insert(tblname, row3, function(){

								//test row inserts
								db.getJSON(function(j){

									assert.deepEqual(j.tables[tblname].data, [row, row2, row3])

									var foo = {
										table: tblname,
										where: ["field_1", "val1"]
									}
									db.delete('row', foo, function(){

										//test delete rows
										db.getJSON(function(j){

											assert.deepEqual(j.tables[tblname].data, [row2])

											var foo = {
												table: tblname,
												data: {
													where: ["field_1", "val4"],
													set: ["field_1", "new val"]
												}
											}
											db.update('row', foo, function(){

												db.getJSON(function(j){

													assert.deepEqual(j.tables[tblname].data, [["new val", "val5", "val6"]])
													done()
												})
											})
										})
									})//end delete row
								})

							})//end insert
						})//end insert
					})//end insert
				})//end create col
			})//end create table
	})

	it('Should chain correctly', function(done){
		done()
	})
})