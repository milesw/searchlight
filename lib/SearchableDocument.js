//  Docs: http://docs.vivosearchlight.org/#searchabledocument

/*
* Module dependencies
*/
var readability = require('readability'),
    bond = require('bond'),
    $ = require('jQuery');



/* SearchableDocument
* Wrapper for the DOM of the page that was sent from the client. 
* enables extraction of main content and removal of HTML, 
* JavaScript and CSS
*
* Note that manipulating SearchableDocument properties prepended by _ 
* via non-SearchableDocument methods may have unintended consequences.
*
* Docs: 
*/
var SearchableDocument = function(body){

  //populate DOM
  this._DOM = body;
  this._MCHTML = false;
  this._MCText = false;
  this._$ = $;
  this.wordCount = 0;
  this.queryText = '';

};


SearchableDocument.prototype.init = function(readabilityParse){
  var dfd = bond.Deferred();

  this._DOM = this.stripScripts(this._DOM);

  if(readabilityParse){

    gettingMainContent = this.readabilityParse();

    if(typeof gettingMainContent === 'function' && mainContentPromise.then){
      gettingMainContent.then(function(){
        this._extractSearchText(dfd);
      });
    }else {
      this._extractSearchText(dfd);
    }
  } else{
    this._extractSearchText(dfd);
  }

  return dfd.promise();
};

SearchableDocument.prototype._extractSearchText = function(dfd){

  this.queryText = this.setMCText() ? this._MCText : this._DOM;
  this.queryText = this.checkHasHTML(this.queryText) ? this.stripHTML(this.queryText) : this.queryText;
  this.setWordCount();

  dfd.resolve(true);

};


//  Use Readibility to extract main content from a document
SearchableDocument.prototype.readabilityParse = function(){

  if(!this.checkHasHTML(this._DOM)){
    return false;
  }

  var dfd = bond.Deferred(),
      that = this;

  readability.parse(this._DOM, 'someurl', function(result){
    var fail = /Sorry\, unable to parse article content\. Please view the original page instead/.test(result.content);
    if (fail){
      dfd.resolve(false);
      return;
    }
    that._MCHTML = result.content;
    dfd.resolve(true);
  });

  return dfd.promise();

};


SearchableDocument.prototype.setMCText = function(){

  if(this._MCHTML){
    this._MCText = this.stripHTML(this._MCHTML);
    return true;
  }
  return false;
};


SearchableDocument.prototype.stripScripts = function(html){
  var text =  html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  return text.length === 0 ? html : text;
};


SearchableDocument.prototype.stripHTML = function(html){
  var text = $(html).text().replace(/\s+/g, " ");
  return text.length === 0 ? html : text;
};


SearchableDocument.prototype.checkHasHTML = function(text){
  return (/<[^>]*?>/).test(text);
};


SearchableDocument.prototype.setWordCount = function(){
  var toCheck = this.queryText ? this.queryText : (this.MCText ? this.MCText : this.DOM);
  var wordCount = toCheck.match(/\S+/g);
  if(wordCount) this.wordCount = wordCount.length;
  else this.wordCount = 0;

};



/*
*
*Expose SearchableDocument API (Public API)
*
*/
exports.SD = SearchableDocument;
