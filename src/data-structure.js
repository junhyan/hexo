function bubbleSort(arr) {
    if (!(arr instanceof Array)) {
        return;
    }
    for (let i = arr.length - 1, needChange = true ; i > 0 && needChange; i--) {
        needChange = false;
        for (let j = 0; j < i; j++) {
            if (arr[j] > arr[j+1]) {
                var tmp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = tmp;
                needChange = true;
            }
        }
    }
}

function selectSort(arr) {
    if (!(arr instanceof Array)) {
        return;
    }
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] > arr[j]) {
                var tmp = arr[i];
                arr[i] = arr[j];
                arr[j] = tmp;
            }
        }
    }
}

function partition(arr, low, high) {
    let key = arr[low];
    while (low < high) {
        while (low < high && arr[high] > key) {
            high--;
        }
        arr[low] = arr[high];
        while (low < high && arr[low] < key) {
            low++;
        }
        arr[high] = arr[low];
    }
    arr[low] = key;
    return low;
}

function quickSort(arr, low, high) {
    if (low < high) {
        let pivotLocation = partition(arr, low, high);
        console.log(pivotLocation, low, high);
        quickSort(arr, low, pivotLocation - 1);
        quickSort(arr, pivotLocation + 1, high);
    }
}

function frontIterator(root) {
    if (!root) {
        return;
    }
    console.log(root.value);
    frontIterator(root.left);
    frontIterator(root.right);
}

function middleIterator(root) {
    if (!root) {
        return;
    }
    middleIterator(root.left);
    console.log(root.value);
    middleIterator(root.right);
}

function backIterator(root) {
    if (!root) {
        return;
    }
    backIterator(root.left);
    backIterator(root.right);
    console.log(root.value);
}

function frontIteratorLoop(root) {
    if (!root) {
        return;
    }
    let stack = [];
    let p = root;
    while(p || stack.length > 0){
        if (p) {
            console.log(p.value);
            stack.push(p);
            p = p.left;     
        } else {
            p = stack.pop().right;
        }
        
    }
}

function middleIteratorLoop(root) {
    if (!root) {
        return;
    }
    let stack = [];
    let p = root;
    while(p || stack.length > 0){
        if (p) {
            stack.push(p);
            p = p.left;     
        } else {
            p = stack.pop();
            console.log(p.value);
            p = p.right;
        }
        
    }
}

// function backIteratorLoop(root) {
//     if (!root) {
//         return;
//     }
//     let stack = [];
//     let p = root;
//     while(p || stack.length > 0){
      
//     }
// }



// function LinkNode(value, left, right) {
//     this.value = value;
//     this.left = left;
//     this.right = right;
// }

// var node7 = new LinkNode(7, null, null);
// var node3 = new LinkNode(3,null, node7);
// var node4 = new LinkNode(4, null, null);
// var node5 = new LinkNode(5, null, null);
// var node6 = new LinkNode(6, null, null);
// var node1 = new LinkNode(1, node3, node4);
// var node2 = new LinkNode(2, node5, node6);
// var root = new LinkNode(0, node1, node2);
/*
*          0
*      1        2
*   3     4  5      6
*      7
*/

//backIteratorLoop(root);


// var array = [4, 9, 1, 3, 8];
// var array1 = [1,2,3,4,5];
// quickSort(array, 0, 4);
// console.log(array);




function Node(value, children) {
    this.value = value;
    this.children = children;
}
var node3 = new Node(3, []);
var node7 = new Node(7, [node3]);
var node4 = new Node(4, []);
var node5 = new Node(5, []);
var node6 = new Node(6, [node7]);
var node1 = new Node(1, [node6]);
var node2 = new Node(2, [node4, node5]);
var root = new Node(0, [node1, node2]);
/*
*          0
*      1    2    3
*      6  4  5    
*      7
*/
var count = 0;
var sum = 0;
function deepIterator(root) {
    console.log(root.value);
    if (root.children.length !== 0) {
        count++
        for (let i = 0; i < root.children.length; i++) {
            deepIterator(root.children[i]);
        }
    } else {
        if (sum < count + 1) {
            sum = count + 1;
        }
        count = 0;
    }  
}
var stack = [];
function layerIterator(root) {
    console.log(root.value);
    
    if (root.children.length !== 0) {
        count++
        for (let i = 0; i < root.children.length; i++) {
            stack.push(root.children[i]);
            //layerIterator(root.children[i]);
        }
    } else {
        if (sum < count + 1) {
            sum = count + 1;
        }
        count = 0;
    }  
}
layerIterator(root);
console.log(sum);

function a () {
    i = 0
    return ++i;  
}
console.log(a());
console.log(a());