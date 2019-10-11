// seperate the qr decomp

class QrDecomposition$$1 {
    constructor(value) { // a 
      value = WrapperMatrix2D.checkMatrix(value);  // checks if its of matrix type
  
      var qr = value.clone();
      var m = value.rows;
      var n = value.columns;
      var rdiag = new Array(n);
      var i, j, k, s;
  
      for (k = 0; k < n; k++) {
        var nrm = 0;
        for (i = k; i < m; i++) {
          nrm = hypotenuse(nrm, qr.get(i, k));  //get means ith row jth coulun, hypotneous sqrt(a**2+b**2)
        }
        if (nrm !== 0) {
          if (qr.get(k, k) < 0) {
            nrm = -nrm;
          }
          for (i = k; i < m; i++) {
            qr.set(i, k, qr.get(i, k) / nrm);
          }
          qr.set(k, k, qr.get(k, k) + 1);
          for (j = k + 1; j < n; j++) {
            s = 0;
            for (i = k; i < m; i++) {
              s += qr.get(i, k) * qr.get(i, j);
            }
            s = -s / qr.get(k, k);
            for (i = k; i < m; i++) {
              qr.set(i, j, qr.get(i, j) + s * qr.get(i, k));
            }
          }
        }
        rdiag[k] = -nrm;
      }
  
      this.QR = qr;
      this.Rdiag = rdiag;
    }


    solve(value) { // x vector
      value = Matrix.checkMatrix(value);
      var qr = this.QR;
      var m = qr.rows;

      if (!this.isFullRank()) {
        throw new Error('Matrix is rank deficient');
      }

      var count = value.columns;
      var X = value.clone();
      var n = qr.columns;
      var i, j, k, s;
  
      for (k = 0; k < n; k++) {
        for (j = 0; j < count; j++) {
          s = 0;
          for (i = k; i < m; i++) {
            s += qr[i][k] * X[i][j];
          }
          s = -s / qr[k][k];
          for (i = k; i < m; i++) {
            X[i][j] += s * qr[i][k];
          }
        }
      }
      for (k = n - 1; k >= 0; k--) {
        for (j = 0; j < count; j++) {
          X[k][j] /= this.Rdiag[k];
        }
        for (i = 0; i < k; i++) {
          for (j = 0; j < count; j++) {
            X[i][j] -= X[k][j] * qr[i][k];
          }
        }
      }
  
      return X.subMatrix(0, n - 1, 0, count - 1);
    }
  

    isFullRank() {
      var columns = this.QR.columns;
      for (var i = 0; i < columns; i++) {
        if (this.Rdiag[i] === 0) {
          return false;
        }
      }
      return true;
    }

  }
  