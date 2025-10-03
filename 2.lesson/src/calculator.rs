use std::ops::Index;

///-------------------------------------------------------------------------------
///
/// This is your calculator implementation task
/// to practice enums, structs, and methods.
///
/// Complete the implementation of the Calculator struct and its methods.
///
/// The calculator should support basic arithmetic
/// operations (addition, subtraction, multiplication)
/// with overflow protection and maintain a history
/// of operations.
///
/// Tasks:
/// 1. Implement the OperationType enum methods
/// 2. Implement the Operation struct constructor
/// 3. Implement all Calculator methods
///
///-------------------------------------------------------------------------------

#[derive(Clone)]
pub enum OperationType {
    Addition,
    Subtraction,
    Multiplication,
}

impl OperationType {
    // Addition -> "+", Subtraction -> "-", Multiplication -> "*"
    pub fn get_sign(&self) -> &str {
        match self {
            OperationType::Addition => "+",
            OperationType::Subtraction => "-",
            OperationType::Multiplication => "*",
        }
    }

    // Return Some(result) on success, None on overflow
    //
    // Example: OperationType::Multiplication.perform(x, y)
    pub fn perform(&self, x: i64, y: i64) -> Option<i64> {
        let (result, is_overflow) = match self {
            OperationType::Addition => x.overflowing_add(y),
            OperationType::Subtraction => x.overflowing_sub(y),
            OperationType::Multiplication => x.overflowing_mul(y),
        };

        if is_overflow {
            return None;
        }
        Some(result)
    }
}

#[derive(Clone)]
pub struct Operation {
    pub first_num: i64,
    pub second_num: i64,
    pub operation_type: OperationType,
}

impl Operation {
    pub fn new(first_num: i64, second_num: i64, operation_type: OperationType) -> Self {
        Self {
            first_num,
            second_num,
            operation_type,
        }
    }

    pub fn perform(&self) -> Option<i64> {
        self.operation_type.perform(self.first_num, self.second_num)
    }
}

pub struct Calculator {
    pub history: Vec<Operation>,
}

impl Calculator {
    pub fn new() -> Self {
        Self { history: vec![] }
    }

    // Return Some(result) on success, None on overflow
    pub fn addition(&mut self, x: i64, y: i64) -> Option<i64> {
        let op = Operation::new(x, y, OperationType::Addition);
        let Some(result) = op.perform() else {
            return None;
        };
        self.history.push(op);
        Some(result)
    }

    // Return Some(result) on success, None on overflow
    pub fn subtraction(&mut self, x: i64, y: i64) -> Option<i64> {
        let op = Operation::new(x, y, OperationType::Subtraction);
        let Some(result) = op.perform() else {
            return None;
        };
        self.history.push(op);
        Some(result)
    }

    // Return Some(result) on success, None on overflow
    pub fn multiplication(&mut self, x: i64, y: i64) -> Option<i64> {
        let op = Operation::new(x, y, OperationType::Multiplication);
        let Some(result) = op.perform() else {
            return None;
        };
        self.history.push(op);
        Some(result)
    }

    // Format: "index: first_num operation_sign second_num = result\n"
    //
    // Example: "0: 5 + 3 = 8\n1: 10 - 2 = 8\n"
    pub fn show_history(&self) -> String {
        self.history
            .iter()
            .enumerate()
            .map(|(i, op)| {
                format!(
                    "{i}: {} {} {} = {}\n",
                    op.first_num,
                    op.operation_type.get_sign(),
                    op.second_num,
                    op.perform().unwrap() // unwrap as history has only successfull ops
                )
            })
            .collect::<Vec<_>>()
            .join("")
    }

    // Add the repeated operation to history and return the result
    // Return None if the index is invalid
    pub fn repeat(&mut self, operation_index: usize) -> Option<i64> {
        if operation_index >= self.history.len() {
            return None;
        }

        let op = self.history.index(operation_index);
        match op.operation_type {
            OperationType::Addition => self.addition(op.first_num, op.second_num),
            OperationType::Subtraction => self.subtraction(op.first_num, op.second_num),
            OperationType::Multiplication => self.multiplication(op.first_num, op.second_num),
        }
    }

    pub fn clear_history(&mut self) {
        self.history.clear();
    }
}
