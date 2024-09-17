/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("mdjcxqgwlt3f5ed")

  // remove
  collection.schema.removeField("vikbb20c")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "irsy03eg",
    "name": "special",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "star",
        "heart",
        "new"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("mdjcxqgwlt3f5ed")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vikbb20c",
    "name": "special",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // remove
  collection.schema.removeField("irsy03eg")

  return dao.saveCollection(collection)
})
