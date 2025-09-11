using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using MantenimientoVariablesApi.Controllers;
using MantenimientoVariablesApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace MantenimientoVariablesApi.Tests
{
    public class FormulaControllerTests
    {
        [Fact]
        public void GetAll_ReturnsList()
        {
            var controller = new FormulaController();
            var result = controller.GetAll();
            Assert.IsType<List<Formula>>(result.Value);
        }

        [Fact]
        public void Create_AddsFormula()
        {
            var controller = new FormulaController();
            var formula = new Formula { Name = "Test", OriginalFormula = "x+1", Result = 2 };
            var result = controller.Create(formula);
            Assert.IsType<CreatedAtActionResult>(result.Result);
        }
    }
}
