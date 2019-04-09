import numpy as np

data = np.loadtxt('./3.0.dat')


data = np.column_stack([data[:, 0], data])

file = open('tmp.dat', 'w')
for th in np.unique(data[:, 1]):
    dat = data[data[:, 1] == th]
    np.savetxt(file, dat, fmt='%.8f', delimiter='\t')
    file.write('\n')
