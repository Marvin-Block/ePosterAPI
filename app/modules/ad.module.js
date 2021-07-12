const ldap = require('ldapjs')
const AdConfig = require('../config/ldap.config');

/**
 * @typedef Token
 * @property {boolean} Valid True if preceding operation was successful.
 * @property {string} Data Contains return data or error message.
 */

/**
 * Takes an IP-Address and determines the associated Store number and Location name.
 * @param ipAddress
 * @returns {Promise<Token>}
 */
exports.resolveFil = (ipAddress) => {
    return new Promise(resolve => {
        const ldapSearchOpts = {
            filter: `(&(wWWHomePage=${ipAddress.slice(0,-2)}*))`,
            scope: 'one'
        }

        let client = ldap.createClient({url:AdConfig.url});

        client.on('error', (err) => {
            if(err)
                return resolve({Valid:false, Data:{ FilNr: '000', Description: `LDAP create client error on 'error' (${ipAddress})`}});
        })

        client.bind(AdConfig.usernameDN,AdConfig.password, (err) => {
            if(err)
                return resolve({Valid:false, Data:{ FilNr: '000', Description: `LDAP bind error (${ipAddress})`}});
        })

        client.search(AdConfig.searchDN, ldapSearchOpts, (err, res) => {
            let topFil;
            let subFil;
            res.on('error', () => {
                return resolve({Valid:false, Data:{ FilNr: '000', Description: `LDAP search error on 'AdConfig.searchDN' (${ipAddress})`}});
            });

            res.on('searchEntry', (entry) => {
                if(!topFil)
                    topFil = entry.object;
            });

            res.on('end', (result) => {
                if(result.status === 0 && topFil){
                    client.search(topFil.dn, {filter:`(givenName=${topFil.name})`, scope: 'one', attributes: 'description'}, (err, res) => {

                        res.on('error', (err) => {
                            if(err)
                                return resolve({Valid:false, Data:{ FilNr: '000', Description: `LDAP search error on 'topFil.dn' (${ipAddress})`}});
                        });

                        res.on('searchEntry', (entry) => {
                            if(!subFil)
                                subFil = entry.object;
                        });

                        res.on('end', (result) => {
                            if(result.status === 0 && subFil)
                                return resolve({ Valid:true, Data: { FilNr: topFil.name.slice(-3), Description: subFil.description } } );
                            else
                                return resolve({Valid:false, Data: { FilNr: '000', Description: `LDAP search error on 'subFil end' (${ipAddress})`}});
                        });
                    });
                }
                else
                    return resolve({Valid:false, Data: { FilNr: '000', Description: `Unbekannte Filiale. (${ipAddress})`}});
            });
        });
    })

}