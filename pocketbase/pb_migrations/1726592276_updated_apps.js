/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("mdjcxqgwlt3f5ed")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7wzd8jza",
    "name": "tap",
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("mdjcxqgwlt3f5ed")

  // remove
  collection.schema.removeField("7wzd8jza")

  return dao.saveCollection(collection)
})
