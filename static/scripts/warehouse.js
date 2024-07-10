
// A basic random number generator function
function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

class RandomForestClassifier {
  constructor(n_estimators = 100, random_state = null) {
      this.n_estimators = n_estimators;
      this.random_state = random_state;
      this.trees = [];
  }

  fit(X, y) {
      seededRandom(this.random_state);

      for (let i = 0; i < this.n_estimators; i++) {
          const sample_indices = this.getRandomIndices(X.length);
          const X_subset = sample_indices.map(index => X[index]);
          const y_subset = sample_indices.map(index => y[index]);
          const tree = new DecisionTreeClassifier();
          tree.fit(X_subset, y_subset);
          this.trees.push(tree);
      }
  }

  getRandomIndices(length) {
      const indices = [];
      for (let i = 0; i < length; i++) {
          indices.push(Math.floor(Math.random() * length));
      }
      return indices;
  }

  predict(X) {
      const predictions = this.trees.map(tree => tree.predict(X));
      const transposed = this.transpose(predictions);
      return transposed.map(pred => this.mean(pred));
  }

  transpose(matrix) {
      return matrix[0].map((col, i) => matrix.map(row => row[i]));
  }

  mean(array) {
      return array.reduce((acc, val) => acc + val, 0) / array.length;
  }
}

class DecisionTreeClassifier {
  constructor() {
      this.tree = null;
  }

  fit(X, y) {
      this.tree = this.buildTree(X, y);
  }

  predict(X) {
      if (this.tree === null) {
          throw new Error("The model has not been trained yet.");
      }
      return X.map(sample => this.predictSingle(sample, this.tree));
  }

  predictSingle(sample, tree) {
      if (tree instanceof Array) {
          const [feature, threshold, leftSubtree, rightSubtree] = tree;
          if (sample[feature] <= threshold) {
              return this.predictSingle(sample, leftSubtree);
          } else {
              return this.predictSingle(sample, rightSubtree);
          }
      } else {
          return tree;
      }
  }

  buildTree(X, y) {
      if (new Set(y).size === 1) {
          return y[0];
      }
      if (X.length === 0) {
          return y[Math.floor(Math.random() * y.length)];
      }
      const { bestFeature, bestThreshold } = this.findBestSplit(X, y);
      const leftIndices = X.map(row => row[bestFeature] <= bestThreshold);
      const rightIndices = leftIndices.map(index => !index);
      const leftTree = this.buildTree(
          X.filter((_, index) => leftIndices[index]),
          y.filter((_, index) => leftIndices[index])
      );
      const rightTree = this.buildTree(
          X.filter((_, index) => rightIndices[index]),
          y.filter((_, index) => rightIndices[index])
      );
      return [bestFeature, bestThreshold, leftTree, rightTree];
  }

  findBestSplit(X, y) {
      let bestGini = Infinity;
      let bestFeature = null;
      let bestThreshold = null;
      for (let feature = 0; feature < X[0].length; feature++) {
          const thresholds = [...new Set(X.map(row => row[feature]))];
          thresholds.forEach(threshold => {
              const gini = this.computeGini(X, y, feature, threshold);
              if (gini < bestGini) {
                  bestGini = gini;
                  bestFeature = feature;
                  bestThreshold = threshold;
              }
          });
      }
      return { bestFeature, bestThreshold };
  }

  computeGini(X, y, feature, threshold) {
      const leftIndices = X.map(row => row[feature] <= threshold);
      const rightIndices = leftIndices.map(index => !index);
      const leftGini = this.giniImpurity(y.filter((_, index) => leftIndices[index]));
      const rightGini = this.giniImpurity(y.filter((_, index) => rightIndices[index]));
      const leftWeight = leftIndices.filter(val => val).length / X.length;
      const rightWeight = rightIndices.filter(val => val).length / X.length;
      return leftWeight * leftGini + rightWeight * rightGini;
  }

  giniImpurity(y) {
      const counts = y.reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
      }, {});
      const proportions = Object.values(counts).map(count => count / y.length);
      return 1 - proportions.reduce((sum, proportion) => sum + proportion ** 2, 0);
  }
}


class KMeans {
  constructor(n_clusters = 8, max_iter = 3000, random_state = null) {
      this.n_clusters = n_clusters;
      this.max_iter = max_iter;
      this.random_state = random_state;
      this.centroids = null;
  }

  fit(X) {
      seededRandom(this.random_state);

      // Initialize centroids based on unique quantities
      const uniqueQuantities = [...new Set(X.map(item => item[0]))];
      const initialIndices = [];
      for (const quantity of uniqueQuantities) {
          const indices = X.reduce((acc, val, index) => {
              if (val[0] === quantity) acc.push(index);
              return acc;
          }, []);
          initialIndices.push(indices[Math.floor(Math.random() * indices.length)]);
      }
      this.centroids = initialIndices.map(index => X[index]);

      for (let i = 0; i < this.max_iter; i++) {
          const labels = this.assignLabels(X);

          // Update centroids based on the mean of each feature within the cluster
          const newCentroids = Array.from({ length: this.n_clusters }, () => Array(X[0].length).fill(0));
          const clusterCounts = Array(this.n_clusters).fill(0);
          for (let k = 0; k < this.n_clusters; k++) {
              const clusterIndices = labels.reduce((acc, val, index) => {
                  if (val === k) acc.push(index);
                  return acc;
              }, []);
              const clusterData = clusterIndices.map(index => X[index]);
              clusterCounts[k] = clusterData.length;

              if (clusterData.length > 0) {
                  const clusterMean = clusterData.reduce((acc, val) => acc.map((x, j) => x + val[j]), Array(X[0].length).fill(0));
                  newCentroids[k] = clusterMean.map(x => x / clusterData.length);
              } else {
                  // If no items in the cluster, keep the current centroid
                  newCentroids[k] = this.centroids[k];
              }
          }

          // Check for convergence
          let converged = true;
          for (let k = 0; k < this.n_clusters; k++) {
              if (!this.areArraysEqual(this.centroids[k], newCentroids[k])) {
                  converged = false;
                  break;
              }
          }

          if (converged) break;

          this.centroids = newCentroids;
      }

      return this;
  }

  assignLabels(X) {
      const distances = X.map(point =>
          this.centroids.map(centroid =>
              Math.sqrt(point.reduce((acc, val, i) => acc + Math.pow(val - centroid[i], 2), 0))
          )
      );
      return distances.map(distArr => distArr.indexOf(Math.min(...distArr)));
  }

  areArraysEqual(arr1, arr2) {
      return arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
  }
}

// Data first index is ID
const data = [
  // Tools
  [0, 2, 0, 1],
  // Plumbing
  [0, 3, 0, 2],
  // Fasteners
  [0, 4, 0, 3],
  // Others
  [0, 5, 0, 4],

  // Building Material
  // Wood
  [0, 1, 1, 5],
  // Steel
  [0, 1, 2, 6],
  // Concrete
  [0, 1, 3, 7],
  // Ceramic
  [0, 1, 4, 8],
  
];

/**
 * 1. You cannot have same pattern with different quadrant or same features with different labels
 * 2. If have same pattern then it will produce error
 * 3. We can avoid the error by specifying ID on the first feature
 * 4. The more pattern we have, the priority it is 
 * 5. if the you have same amount of more than 2 different features but different labels then it will be average
 * 
 * solution:
 * Add 2 data 
 * 
 * Logs
 * Analytics
 * 
 * 
 * 
 */

class Warehouse {
  constructor() {
    this.features = data.map(row => row.slice(0, -1));
    this.labels = data.map(row => row.slice(-1)[0]);
    
    // Assuming the RandomForestClassifier class has been defined previously
    
    // Instantiating RandomForestClassifier
    this.rfClassifier = new RandomForestClassifier(10000, 42);
    this.rfClassifier.fit(this.features, this.labels);
  }
}