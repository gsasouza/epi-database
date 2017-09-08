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
    it('Should download a file', (done)=>{
    const filePath = './tmp/tgg_export_caepi.rar';
    Epi.downloadFile(filePath)
      .then((fileName)=> fs.readFileAsync(filePath, 'binary'))
      .then((file)=> done())
      .catch((err)=> err.should.be.eql(null));
    });
  });
});
