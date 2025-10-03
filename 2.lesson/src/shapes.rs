use std::f64::consts::PI;

///-------------------------------------------------------------------------------
///
/// This is your first task to get warmed up and see how useful traits can be.
///
/// Complete the implementation of methods in the Rectangle and Circle structs,
/// then implement the Shape trait for both structs.
///
/// Tasks:
/// 1. Implement Rectangle struct methods (constructor, setters, getters)
/// 2. Implement Circle struct methods (constructor, setter, getter)  
/// 3. Implement the Shape trait for both Rectangle and Circle
/// 4. Handle validation errors properly using the Error enum
///
///-------------------------------------------------------------------------------

pub trait Shape {
    fn area(&self) -> f64;
    fn perimeter(&self) -> f64;
}

pub struct Rectangle {
    width: f64,
    height: f64,
}

pub struct Circle {
    radius: f64,
}

#[derive(Debug, PartialEq)]
pub enum Error {
    InvalidWidth,
    InvalidHeight,
    InvalidRadius,
}

// Width and height are considered invalid if they are negative.
// All methods should return the corresponding error when invalid values are provided.
impl Rectangle {
    pub fn new(width: f64, height: f64) -> Result<Self, Error> {
        let mut rect = Self {
            width: 0f64,
            height: 0f64,
        };
        rect.set_width(width)?;
        rect.set_height(height)?;
        Ok(rect)
    }

    pub fn set_width(&mut self, width: f64) -> Result<(), Error> {
        if width < 0f64 {
            return Err(Error::InvalidWidth);
        }

        self.width = width;
        Ok(())
    }

    pub fn set_height(&mut self, height: f64) -> Result<(), Error> {
        if height < 0f64 {
            return Err(Error::InvalidHeight);
        }

        self.height = height;
        Ok(())
    }

    pub fn get_width(&self) -> f64 {
        self.width
    }

    pub fn get_height(&self) -> f64 {
        self.height
    }
}

// The radius is considered invalid if it is negative.
// All methods should return the corresponding error when invalid values are provided.
impl Circle {
    pub fn new(radius: f64) -> Result<Self, Error> {
        let mut circle = Circle { radius: 0f64 };
        circle.set_radius(radius)?;
        Ok(circle)
    }

    pub fn set_radius(&mut self, radius: f64) -> Result<(), Error> {
        if radius < 0f64 {
            return Err(Error::InvalidRadius);
        }

        self.radius = radius;
        Ok(())
    }

    pub fn get_radius(&self) -> f64 {
        self.radius
    }
}

// Hint: Use std::f64::consts::PI to calculate the area and circumference of the circle.

impl Shape for Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn perimeter(&self) -> f64 {
        (self.width + self.height) * 2.
    }
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        PI * self.radius * self.radius
    }

    fn perimeter(&self) -> f64 {
        2. * PI * self.radius
    }
}
