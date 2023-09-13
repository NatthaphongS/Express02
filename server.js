require("dotenv").config();
const fs = require("fs/promises");
const express = require("express");
const app = express();

const productFile = "./resource/products.json";
const deletedFile = "./resource/deleted.json";
const getfile = (file) => {
  return fs.readFile(file, "utf8").then(JSON.parse);
};

app.get("/products", (req, res) => {
  let { _page, _limit } = req.query;
  if (!_page) _page = 1;
  if (!_limit) _limit = 10;
  const startIndex = (_page - 1) * _limit;
  const endIndex = startIndex + +_limit;
  //   console.log(startIndex, endIndex);
  getfile(productFile).then((allProduct) => {
    const targetProduct = allProduct.slice(startIndex, endIndex);
    res.json(targetProduct);
  });
});

// V1.
app.delete("/product/:id", (req, res) => {
  const { id } = req.params;
  //   console.log(id);
  getfile(productFile)
    .then((allProduct) => {
      const deleteIndex = allProduct.findIndex((product) => product.id === +id);
      const deleteProduct = allProduct.splice(deleteIndex, 1);
      res.json(deleteProduct);
      //   fs.writeFile(deletedFile, JSON.stringify(deleteProduct));
      fs.writeFile(productFile, JSON.stringify(allProduct, null, 4));
      return deleteProduct;
    })
    .then((deleteProduct) => {
      getfile(deletedFile).then((allDeleted) => {
        // console.log(allDeleted);
        // console.log(deleteProduct);
        if (Array.isArray(allDeleted)) {
          const newDeleteProduct = [...deleteProduct, ...allDeleted];
          fs.writeFile(deletedFile, JSON.stringify(newDeleteProduct, null, 4));
        } else {
          fs.writeFile(deletedFile, JSON.stringify(deleteProduct, null, 4));
        }
      });
    });
});

app.get("/products/sort", (req, res) => {
  let { min, max } = req.query;
  console.log(min, max);
  getfile(productFile).then((allProduct) => {
    const targetProduct = allProduct.filter(
      (product) => product.price >= min && product.price <= max
    );
    res.json(targetProduct);
  });
});

let port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
