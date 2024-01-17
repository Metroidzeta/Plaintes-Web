'use strict'

const express = require('express')
const morgan = require('morgan')
const fsp = require('fs/promises')

const app = express()
const port = 8081
const cheminBDD = 'database.json'

app.use(express.json())
app.use(morgan('dev'))

console.log("L'api serveur demarre!")

async function obtenirDataBDD() {
    const data = await fsp.readFile(cheminBDD, 'utf8')
    return JSON.parse(data)
}

async function remplacerDataBDD(db) {
    const data = JSON.stringify(db)
    await fsp.writeFile(cheminBDD, data)
}

const server = app.listen(port, () => {
    console.log(`Le serveur ecoute sur le port ${port}`)
})

function arreterServeur() {
    server.close()
}

const send500Error = (res, err) => {
    console.error(`Erreur : ${err}`)
    res.sendStatus(500)
}

const getEnsemble = async(req, res, key) => {
    try {
        const db = await obtenirDataBDD()
        res.status(200).json(db[key])
    } catch (err) {
        send500Error(res, err)
    }
}

module.exports = {app, obtenirDataBDD, arreterServeur}

/*** REQUETES GET ***/
app.get('/info', (req, res) => {
    res.send('api-server-1.0.0')
})

app.get('/structures', (req, res) => {
    getEnsemble(req, res, 'structures')
})

app.get('/plaintes', (req, res) => {
    getEnsemble(req, res, 'plaintes')
})

app.get('/structures/:structure_id', async(req, res) => {
    const struct_id = parseInt(req.params.structure_id)
    try {
        const db = await obtenirDataBDD()
        const structure = db.structures.find((s) => s.id === struct_id)
        if (structure) {
            res.status(200).json(structure)
        } else {
            console.log(`Echec : La structure avec l'id : ${struct_id} n'existe pas`)
            res.sendStatus(404)
        }
    } catch (err) {
        send500Error(res, err)
    }
})

app.get('/plaintes/:plainte_id', async(req, res) => {
    const plainte_id = parseInt(req.params.plainte_id)
    try {
        const db = await obtenirDataBDD()
        const plainte = db.plaintes.find((p) => p.id === plainte_id)
        if (plainte) {
            res.status(200).json(plainte)
        } else {
            console.log(`Echec : La plainte avec l'id : ${plainte_id} n'existe pas`)
            res.sendStatus(404)
        }
    } catch (err) {
        send500Error(res, err)
    }
})

/*** REQUETES POST ***/
app.post('/deposer-plainte', async(req, res) => {
    const {nomStructure, titre, contenu} = req.body
    console.log(`Req recu : [structure : ${nomStructure}, titre : ${titre}, contenu : ${contenu}]`)
    if (nomStructure && titre && contenu) {
        try {
            const db = await obtenirDataBDD()
            db.plaintes.push({ // On ajoute la nouvelle plainte
                id: db.plaintes.length,
                structure: nomStructure,
                titre,
                contenu,
            })
            const structure = db.structures.find((s) => s.nom === nomStructure)
            if (!structure) { // Si le nom de la structure n'existe pas dans la BDD
                db.structures.push({ // On ajoute la nouvelle structure à la BDD
                    id: db.structures.length,
                    nom: nomStructure,
                })
            }
            await remplacerDataBDD(db)
            console.log('Reussi : La nouvelle plainte a bien ete ajoute')
            res.sendStatus(201)
        } catch (err) {
            send500Error(res, err)
        }
    } else {
        console.log('Echec : La requete a un ou plusieurs champ(s) vide(s)')
        res.sendStatus(400)
    }
})

/*** REQUETES PUT ***/
app.put('/structures/:structure_id', async(req, res) => {
    const struct_id = parseInt(req.params.structure_id)
    const nomStructure = req.body.nom
    console.log(`Req recu : [nomStructure : ${nomStructure}]`)

    if (nomStructure) {
        try {
            const db = await obtenirDataBDD()
            const structure = db.structures.find((s) => s.id === struct_id)
            if (structure) { // Si la structure à modifier existe bien
                const structure2 = db.structures.find((s) => s.nom === nomStructure)
                if (!structure2) { // Si le nouveau nom de la structure n'existe pas déjà dans la BDD (doublons interdit)
                    structure.nom = nomStructure // On modifie la structure existante
                    await remplacerDataBDD(db)
                    console.log(`Reussi : Le nom de la structure avec l'id : ${struct_id} a bien ete modifie`)
                    res.sendStatus(200)
                } else {
                    console.log('Echec : Ce nom de structure existe deja dans la base de donnees, la structure n\'a pas pu etre modifie')
                    res.sendStatus(409)
                }
            } else {
                console.log(`Echec : La structure avec l'id : ${struct_id} n'existe pas, donc elle n'a pas pu etre modifie`)
                res.sendStatus(404)
            }
        } catch (err) {
            send500Error(res, err)
        }
    } else {
        console.log('Echec : La requete a un champ vide')
        res.sendStatus(400)
    }
})

app.put('/plaintes/:plainte_id', async(req, res) => {
    const plainte_id = parseInt(req.params.plainte_id)
    const {nomStructure, titre, contenu} = req.body
    console.log(`Req recu : [nomStructure : ${nomStructure}, titre : ${titre}, contenu : ${contenu}]`)

    if (nomStructure && titre && contenu) {
        try {
            const db = await obtenirDataBDD()
            const plainte = db.plaintes.find((p) => p.id === plainte_id)
            if (plainte) { // Si la plainte à modifier existe
                plainte.structure = nomStructure // On modifie la plainte existante
                plainte.titre = titre
                plainte.contenu = contenu
                const structure = db.structures.find((s) => s.nom === nomStructure)
                if (!structure) { // Si le nom de cette structure n'existe pas déjà
                    db.structures.push({ // On ajoute la nouvelle structure
                        id: db.structures.length,
                        nom: nomStructure,
                    })
                }
                await remplacerDataBDD(db)
                console.log(`Reussi : La plainte avec l'id : ${plainte_id} a bien ete modifie`)
                res.sendStatus(200)
            } else {
                console.log(`Echec : La plainte avec l'id : ${plainte_id} n'existe pas, donc elle n'a pas pu etre modifie.`)
                res.sendStatus(404)
            }
        } catch (err) {
            send500Error(res, err)
        }
    } else {
        console.log('Echec : La requete a un ou plusieurs champ(s) vide(s)')
        res.sendStatus(400)
    }
})

/*** REQUETES DELETE ***/
app.delete('/structures/:structure_id', async(req, res) => {
    const struct_id = parseInt(req.params.structure_id)
    try {
        const db = await obtenirDataBDD()
        const structureIndex = db.structures.findIndex((s) => s.id === struct_id)
        if (structureIndex !== -1) { // Si la structure à supprimer existe
            db.structures.splice(structureIndex, 1) // On la supprime
            for (let i = struct_id; i < db.structures.length; i++) { // Mettre à jour les id
                db.structures[i].id = i
            }
            await remplacerDataBDD(db)
            console.log(`Reussi : La structure avec l'id : ${struct_id} a bien ete supprime.`)
            res.sendStatus(200)
        } else {
            console.log(`Echec : La structure avec l'id : ${struct_id} n'existe pas, donc elle n'a pas pu etre supprime.`)
            res.sendStatus(404)
        }
    } catch (err) {
        send500Error(res, err)
    }
})

app.delete('/plaintes/:plainte_id', async(req, res) => {
    const plainte_id = parseInt(req.params.plainte_id)
    try {
        const db = await obtenirDataBDD()
        const plainteIndex = db.plaintes.findIndex((p) => p.id === plainte_id)
        if (plainteIndex !== -1) { // Si la plainte à supprimer existe
            db.plaintes.splice(plainteIndex, 1) // On la supprime
            for (let i = plainte_id; i < db.plaintes.length; i++) { // Mettre à jour les id
                db.plaintes[i].id = i
            }
            await remplacerDataBDD(db)
            console.log(`Reussi : La plainte avec l'id : ${plainte_id} a bien ete supprime.`)
            res.sendStatus(200)
        } else {
            console.log(`Echec : La plainte avec l'id : ${plainte_id} n'existe pas, donc elle n'a pas pu etre supprime.`)
            res.sendStatus(404)
        }
    } catch (err) {
        send500Error(res, err)
    }
})