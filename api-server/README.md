# Plaintes-Web-apiserver

L'api du site web plaintes en ligne

## pour démarrer le serveur

npm start  

npm run start:watch  

## pour démarrer les tests automatisés  

npm test  

npm run test:coverage  

## URL pour tester le serveur

```
http://localhost:8081/
```

ou (avec Nginx)  

```
https://[ton-URL]/api/
```

## exemples requetes curl (pour tester l'api)

Pour les requetes de type GET :  

```
curl -X GET http://localhost:8081/structures/
curl -X GET http://localhost:8081/structures/2
curl -X GET http://localhost:8081/plaintes/
curl -X GET http://localhost:8081/plaintes/0
```

Pour les requetes de type POST :  

```
curl -X POST -H 'Content-Type: application/json' -d '{"nomStructure":"SOIP","titre":"authentification non securise","contenu":"blabla"}' http://localhost:8081/deposer-plainte
```

Pour les requetes de type PUT :  

```
curl -X PUT -H 'Content-Type: application/json' -d '{"nom": "nomStructureModifie"}' http://localhost:8081/structures/3
curl -X PUT -H 'Content-Type: application/json' -d '{"nomStructure":"nomStructureModifie", "titre":"titreModifie","contenu":"contenuModifie"}' http://localhost:8081/plaintes/1
```

Pour les requetes de type DELETE :  

```
curl -X DELETE http://localhost:8081/structures/4
curl -X DELETE http://localhost:8081/plaintes/1
```
