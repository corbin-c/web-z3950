# web-z3950

This tool is a binding to access [Z39.50 protocol](https://www.niso.org/publications/ansiniso-z3950-2003-s2014)
over HTTP. It is a proof-of-concept of using NodeJS to perform Z39.50 requests
with [IndexData's Yaz-client](https://www.indexdata.com/resources/software/yaz/)
and to serve the resulting Marc records.

A demo of this service can be found online at <https://web-z3950.herokuapp.com/>

Called with no parameter, this help is displayed.

The service must be fed three mandatory parameters:
* `server`: the server to connect, in the form `address:port/database`
* `isbn`: a list of ISBN, comma-separated
* `format`: the desired MARC output format, usually `usmarc` or `unimarc`

## Sample query

In order to query the [Library of Congress' Z39.50 server](https://www.loc.gov/z3950/lcserver.html)
for two MARC21 records describing the books identified by ISBN 0596001312 &
0066620724, the following URL must be called:

<https://web-z3950.herokuapp.com/?server=lx2.loc.gov:210/LCDB&isbn=0066620724,0596001312&format=usmarc>

/!\ As for now, this tool only handles basic ISBN searches (`@attr1=7`), it
should be updated to handle all Z39.50 commands.
