
var assert = require('assert'),
	fs = require('fs'),
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
	
	it('Should create new database', function(done){

		//test connecting
		db.connect(dbname, function(){
			
			db.getJSON(function(j){
				var test = { dbname: 'my_database', tables: {} }
				assert.deepEqual(j, test)
				done()
			})
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
					)//end test create table

					//test delete table
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
	
	it('Should query database for results', function(done){

		var cols = ["field_1", "field2", "field3"],
			row = ["val1", "val2", "val3"],
			row2 = ["val4", "val5", "val6"],
			row3 = ["val1", "val7", "val8"]

		db.connect(dbname)
			.create('table', tblname, function(){
				db.create('col', {table:tblname, col:cols}, function(){

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
											})//end query

										})//end insert
									})//end insert
								})//end insert
							})//end insert
						})//end insert
					})//end insert

				})//end create col
			})//end create table
	})
})