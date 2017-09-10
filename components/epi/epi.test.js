global.Promise = require('bluebird');
const chai = require('chai');
const fs = Promise.promisifyAll(require('fs'));
const chaiHttp = require('chai-http');
const app = require('../../app');
const Epi = require('./epi');

chai.should();
chai.use(chaiHttp);

describe('Epi', () => {
  
  describe('Get an Epi /GET -> /api/epis/:caNumber', () => {

    it('Should list one epi', (done) => {
      chai.request(app).get('/api/epis/9722').end((err, res) => {
        res.body.should.have.property('status').eql(200);
        res.body.data.should.be.an('object')
        done();
      });
    });

    it('Should not found a epi', (done) => {
      chai.request(app).get('/api/epis/1').end((err, res) => {
        res.body.should.have.property('status').eql(404);
        res.body.should.be.an('object')
        done();
      });
    });
  });
  
  describe('Update Database Functions', ()=> {
    const filePath = './tmp/tgg_export_caepi.rar';
    let fileName = '';
    let data = [];
    it('Should download a file', function(done){
      this.timeout(30000);
      Epi.downloadFile(filePath)
        .then(()=> fs.readFileAsync(filePath, 'binary'))
        .then(()=> done())
        .catch((err)=> done(err));
    });
    it('Should extract a file', function(done){
      this.timeout(10000);
      Epi.extract(filePath)
        .then((file)=> {
          fileName = file;
          fs.readFileAsync(file, 'binary');    
        })
        .then(()=> done())
        .catch((err)=> done(err));
    });
    it('Should read a file', function(done){
      this.timeout(15000);
      Epi.readFile(fileName)
        .then((epis)=> {
          epis.should.be.an('array');
          data = epis.slice(0, 5);
          (Object.keys(epis[0].toObject())).length.should.be.eql(17);
          done();
        })
        .catch((err)=> done(err));
    });
    it('Should update the database', function(done){
      this.timeout(15000);
      Epi.updateDatabase(data)
        .then(()=> done())
        .catch((err)=> done(err));
    });
    it('Should delete a file', function(done){
      this.timeout(15000);
      Epi.deleteFile()
        .then(()=> fs.readFileAsync(file, 'binary'))
        .then(()=> done())
        .catch((err)=> done(err));
    })
  });
});
