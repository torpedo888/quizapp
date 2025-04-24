using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class LoginDto
    {
        [Required]
        [MaxLength(10)]
        public string UserName { get; set; }
        [MinLength(6)]
        public string Password { get; set; }
    }
}