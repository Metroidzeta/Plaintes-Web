/* Auteur du projet : Metroidzeta
	Pour exécuter l'api serveur :
		> npm start
	Pour exécuter les tests :
		> npm test
*/
const supertest = require('supertest')
const {app, obtenirDataBDD, arreterServeur} = require('../src/index')

describe('API tests', () => {
    it('Test API version info', async() => {
        const response = await supertest(app).get('/info')
        expect(200)
        expect(response.text).toBe('api-server-1.0.0')
    })

    /*** REQUETES POST ***/
    it('Test POST /deposer-plainte [champs vides]', async() => {
        const plainte = {
            nomStructure: null,
            titre: null,
            contenu: null,
        }

        await supertest(app)
            .post('/deposer-plainte')
            .send(plainte)

        expect(400)
    })

    it('Test POST /deposer-plainte', async() => {
        const plainte = {
            nomStructure: 'TestNomStructure',
            titre: 'TestTitle',
            contenu: 'TestContenu',
        }

        await supertest(app)
            .post('/deposer-plainte')
            .send(plainte)

        expect(201)
    })

    /*** REQUETES GET ***/
    it('Test GET /structures', async() => {
        const db = await obtenirDataBDD()
        const response = await supertest(app).get('/structures')
        expect(200)
        expect(response.get('Content-Type')).toMatch(/application\/json/)
        expect(response.body).toBeInstanceOf(Array) // Vérifie que c'est bien un tableau qui est renvoyé
        expect(response.body.length).toBe(db.structures.length) // Vérifie que la taille du tableau renvoyé est la même que celle de la BDD
    })

    it('Test GET /structures/[mauvais indice]', async() => {
        const struct_id = -1 // on prend une structure qui n'existe pas
        await supertest(app).get(`/structures/${struct_id}`)
        expect(404)
    })

    it('Test GET /structures/X', async() => {
        const db = await obtenirDataBDD()
        const struct_id = db.structures.length - 1 // les IDs commencent à 0, on prend la dernière structure (taille - 1)
        const response = await supertest(app).get(`/structures/${struct_id}`)
        expect(200)
        expect(response.get('Content-Type')).toMatch(/application\/json/)
        expect(response.body).toHaveProperty('id', struct_id) // Vérifie que le champ id existe et qu'il correspond à l'id attendu
        expect(response.body).toHaveProperty('nom') // Vérifie qu'il a un champ nom
    })

    it('Test GET /plaintes', async() => {
        const db = await obtenirDataBDD()
        const response = await supertest(app).get('/plaintes')
        expect(200)
        expect(response.get('Content-Type')).toMatch(/application\/json/)
        expect(response.body).toBeInstanceOf(Array)
        expect(response.body.length).toBe(db.plaintes.length) // Vérifie que la taille du tableau renvoyé est la même que celle de la BDD
    })

    it('Test GET /plaintes/[mauvais indice]', async() => {
        const plainte_id = -1 // on prend une plainte qui n'existe pas
        await supertest(app).get(`/plaintes/${plainte_id}`)
        expect(404)
    })

    it('Test GET /plaintes/X', async() => {
        const db = await obtenirDataBDD()
        const plainte_id = db.plaintes.length - 1 // les IDs commencent à 0, on prend la dernière plainte (taille - 1)
        const response = await supertest(app).get(`/plaintes/${plainte_id}`)
        expect(200)
        expect(response.get('Content-Type')).toMatch(/application\/json/)
        expect(response.body).toHaveProperty('id', plainte_id) // Vérifie que le champ id existe et qu'il correspond à l'id attendu
        expect(response.body).toHaveProperty('structure') // Vérifie qu'il a un champ structure
        expect(response.body).toHaveProperty('titre') // Vérifie qu'il a un champ titre
        expect(response.body).toHaveProperty('contenu') // Vérifie qu'il a un champ contenu
    })

    /*** REQUETES PUT ***/
    it('Test PUT /structures/X [champ vide]', async() => {
        const db = await obtenirDataBDD()
        const struct_id = db.structures.length - 1 // les IDs commencent à 0, on prend la dernière structure (taille - 1)
        await supertest(app)
            .put(`/structures/${struct_id}`)
            .send({nom: null})

        expect(400)
    })

    it('Test PUT /structures/[mauvais indice]', async() => {
        const struct_id = -1 // on prend une structure qui n'existe pas
        await supertest(app)
            .put(`/structures/${struct_id}`)
            .send({nom: 'nomStructModifie'})

        expect(404)
    })

    it('Test PUT /structures/X [nomStructure deja existant]', async() => {
        const db = await obtenirDataBDD()
        const struct_id = db.structures.length - 1 // les IDs commencent à 0, on prend la dernière structure (taille - 1)
        await supertest(app)
            .put(`/structures/${struct_id}`)
            .send({nom: 'TestNomStructure'}) // On prend le nom d'une structure qui existe déjà (celle qu'on a ajouté avec POST)

        expect(409)
    })

    it('Test PUT /structures/X', async() => {
        const db = await obtenirDataBDD()
        const struct_id = db.structures.length - 1 // les IDs commencent à 0, on prend la dernière structure (taille - 1)
        await supertest(app)
            .put(`/structures/${struct_id}`)
            .send({nom: 'nomStructModifie'})

        expect(200)
    })

    it('Test PUT /plaintes/X [champs vides]', async() => {
        const db = await obtenirDataBDD()
        const plainte_id = db.plaintes.length - 1 // les IDs commencent à 0, on prend la dernière plainte (taille - 1)
        const plainte = {
            nomStructure: null,
            titre: null,
            contenu: null,
        }
        await supertest(app)
            .put(`/plaintes/${plainte_id}`)
            .send(plainte)

        expect(400)
    })

    it('Test PUT /plaintes/[mauvais indice]', async() => {
        const plainte_id = -1 // on prend une plainte qui n'existe pas
        const plainte = {
            nomStructure: 'nomStructModifie',
            titre: 'titreModifie',
            contenu: 'contenuModifie',
        }
        await supertest(app)
            .put(`/plaintes/${plainte_id}`)
            .send(plainte)

        expect(404)
    })

    it('Test PUT /plaintes/X', async() => {
        const db = await obtenirDataBDD()
        const plainte_id = db.plaintes.length - 1 // les IDs commencent à 0, on prend la dernière structure (taille - 1)
        const plainte = {
            nomStructure: 'nomStructModifie',
            titre: 'titreModifie',
            contenu: 'contenuModifie',
        }
        await supertest(app)
            .put(`/plaintes/${plainte_id}`)
            .send(plainte)

        expect(200)
    })

    /*** REQUETES DELETE ***/
    it('Test DELETE /structures/[mauvais indice]', async() => {
        const struct_id = -1 // on prend une structure qui n'existe pas
        await supertest(app).delete(`/structures/${struct_id}`)
        expect(404)
    })

    it('Test DELETE /structures/X', async() => {
        const db = await obtenirDataBDD()
        const struct_id = db.structures.length - 1 // les IDs commencent à 0, on prend la dernière structure (taille - 1)
        await supertest(app).delete(`/structures/${struct_id}`)
        expect(200)
    })

    it('Test DELETE /plaintes/[mauvais indice]', async() => {
        const plainte_id = -1 // on prend une plainte qui n'existe pas
        await supertest(app).delete(`/plaintes/${plainte_id}`)
        expect(404)
    })

    it('Test DELETE /plaintes/X', async() => {
        const db = await obtenirDataBDD()
        const plainte_id = db.plaintes.length - 1 // les IDs commencent à 0, on prend la dernière plainte (taile - 1)
        await supertest(app).delete(`/plaintes/${plainte_id}`)
        expect(200)
    })

    afterAll(() => {
        arreterServeur()
    })
})